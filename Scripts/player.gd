extends CharacterBody3D

@export var walk_speed: float = 3.0
@export var run_speed: float = 6.0
@export var rotation_speed: float = 5.0
@export var gravity: float = 9.8

var current_animation: String = ""
var is_attacking: bool = false
var animation_player: AnimationPlayer
var weapon_container: Node3D
var shield_container: Node3D
var equipped_weapon: Node3D
var equipped_shield: Node3D

@export_group("Orbit Camera")
@export var mouse_sensitivity: float = 0.003
@export var camera_pitch_min: float = -1.2
@export var camera_pitch_max: float = 0.5
@export var camera_eye_height: float = 1.5
@export var auto_face_camera: bool = true
@export var face_camera_speed: float = 10.0

var camera_rig: Node3D
var camera_yaw: Node3D
var camera_pitch: Node3D

@export_group("Sword Tuning")
@export var sword_offset: Vector3 = Vector3(0.25, -0.8, -0.001408)
@export var sword_rotation_deg: Vector3 = Vector3(539.9966, -349.999, -999.9993)
@export var sword_scale: float = 1.0

@export_group("Shield Tuning")
@export var shield_offset: Vector3 = Vector3(-0.08, 0.72, 0.069877)
@export var shield_rotation_deg: Vector3 = Vector3(-9.999817, -179.9998, -94.99973)
@export var shield_scale: float = 1.0

@export_group("Combat Tuning")
@export var sword_damage: int = 10
@export var swing_hit_start: float = 0.08

@export_group("Equip Tuning")
@export var animations_enabled: bool = true

var _swing_can_hit: bool = false
var _sword_hitbox: Area3D

@export_group("Debug Colors")
@export var apply_debug_colors: bool = true
@export var player_color: Color = Color(0.2, 0.4, 1.0)
@export var sword_color: Color = Color(1.0, 0.2, 0.2)
@export var shield_color: Color = Color(0.2, 1.0, 0.3)

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	animation_player = _setup_animation_player()
	_setup_weapon_attachment()
	if animations_enabled:
		if animation_player:
			_load_animations()
			_play_animation("idle")
			animation_player.animation_finished.connect(_on_animation_finished)
		else:
			push_warning("No Skeleton3D found in model hierarchy")
	equip_weapon("res://Assets/Equipment/Sword.glb")
	equip_shield("res://Assets/Equipment/Shield.glb")
	_setup_camera()
	_apply_debug_colors()

func _apply_debug_colors() -> void:
	if not apply_debug_colors:
		return
	var model_container = get_node_or_null("ModelContainer")
	if model_container:
		_set_recursive_color(model_container, player_color)
	if equipped_weapon:
		_set_recursive_color(equipped_weapon, sword_color)
	if equipped_shield:
		_set_recursive_color(equipped_shield, shield_color)

func _set_recursive_color(root: Node, color: Color) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.8
	for mesh_instance in root.find_children("*", "MeshInstance3D", true, false):
		mesh_instance.material_override = mat

func _setup_camera() -> void:
	camera_rig = get_node_or_null("../CameraRig") as Node3D
	if not camera_rig:
		return
	camera_yaw = camera_rig.get_node_or_null("CameraYaw") as Node3D
	if camera_yaw:
		camera_pitch = camera_yaw.get_node_or_null("CameraPitch") as Node3D

func _find_skeleton() -> Skeleton3D:
	var model_container = $ModelContainer
	if not model_container:
		return null
	var skeletons = model_container.find_children("*", "Skeleton3D", true, false)
	if skeletons.size() > 0:
		return skeletons[0]
	return null

func _setup_animation_player() -> AnimationPlayer:
	var skeleton = _find_skeleton()
	if not skeleton:
		return null

	var parent = skeleton.get_parent()

	var existing = parent.get_node_or_null("AnimationPlayer")
	if existing:
		existing.queue_free()

	var anim_player = AnimationPlayer.new()
	anim_player.name = "AnimationPlayer"
	parent.add_child(anim_player)
	anim_player.owner = parent.owner if parent.owner else parent
	return anim_player

func _setup_weapon_attachment() -> void:
	var skeleton = _find_skeleton()
	if not skeleton:
		return

	var hand_attachments = [
		["RightHandAttachment", "mixamorig_RightHand"],
		["LeftHandAttachment", "mixamorig_LeftHand"]
	]

	for entry in hand_attachments:
		var attachment = BoneAttachment3D.new()
		attachment.name = entry[0]
		attachment.bone_name = entry[1]
		skeleton.add_child(attachment)
		attachment.owner = skeleton.owner if skeleton.owner else skeleton

		var container = Node3D.new()
		container.name = entry[0] + "_Container"
		attachment.add_child(container)
		container.owner = attachment.owner

		if entry[1] == "mixamorig_RightHand":
			weapon_container = container
			container.rotation_degrees = Vector3(0, 0, 90)
		else:
			shield_container = container

func equip_weapon(scene_path: String) -> void:
	if not weapon_container:
		return
	unequip_weapon()
	var scene = load(scene_path) as PackedScene
	if scene:
		equipped_weapon = scene.instantiate()
		equipped_weapon.name = "Sword"
		weapon_container.add_child(equipped_weapon)
		equipped_weapon.position = sword_offset
		equipped_weapon.rotation_degrees = sword_rotation_deg
		equipped_weapon.scale = Vector3.ONE * sword_scale
		_add_sword_hitbox()
	else:
		push_warning("Could not load weapon: %s" % scene_path)

func equip_shield(scene_path: String) -> void:
	if not shield_container:
		return
	unequip_shield()
	var scene = load(scene_path) as PackedScene
	if scene:
		equipped_shield = scene.instantiate()
		equipped_shield.name = "Shield"
		shield_container.add_child(equipped_shield)
		equipped_shield.position = shield_offset
		equipped_shield.rotation_degrees = shield_rotation_deg
		equipped_shield.scale = Vector3.ONE * shield_scale
	else:
		push_warning("Could not load shield: %s" % scene_path)

func unequip_weapon() -> void:
	if equipped_weapon:
		equipped_weapon.queue_free()
		equipped_weapon = null

func _add_sword_hitbox() -> void:
	if not equipped_weapon:
		return
	var hitbox := Area3D.new()
	hitbox.name = "SwordHitbox"
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(1.18, 0.2, 0.4)
	shape.shape = box
	shape.position = Vector3(-0.28, 0, 0)
	hitbox.add_child(shape)
	equipped_weapon.add_child(hitbox)
	_sword_hitbox = hitbox
	hitbox.body_entered.connect(_on_sword_hit)

func _on_sword_hit(body: Node) -> void:
	if body.has_method("take_damage"):
		_deal_hit(body)

func _check_swing_hits() -> void:
	if not _sword_hitbox:
		return
	for body in _sword_hitbox.get_overlapping_bodies():
		if body.has_method("take_damage"):
			_deal_hit(body)
			return

func _deal_hit(body: Node) -> void:
	if not _swing_can_hit:
		return
	_swing_can_hit = false
	var dir: Vector3
	if camera_yaw:
		dir = -camera_yaw.global_transform.basis.z
	else:
		dir = -transform.basis.z
	dir.y = 0.0
	dir = dir.normalized()
	body.take_damage(sword_damage, dir)
	print("[SWING] hit -> %s (-%d)" % [body.name, sword_damage])
	_spawn_hit_spark()

func _arm_swing() -> void:
	_swing_can_hit = true
	_check_swing_hits()

func _spawn_hit_spark() -> void:
	if not _sword_hitbox or not is_inside_tree():
		return
	var scene := get_tree().current_scene
	if not scene:
		return
	var spark := MeshInstance3D.new()
	spark.name = "HitSpark"
	var mesh := BoxMesh.new()
	mesh.size = Vector3.ONE * 0.15
	spark.mesh = mesh
	spark.scale = Vector3.ONE * 0.4
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.85, 0.3)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.7, 0.2)
	mat.emission_energy_multiplier = 4.0
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	spark.material_override = mat
	scene.add_child(spark)
	spark.global_position = _sword_hitbox.global_position + Vector3(0, 0.1, 0)
	var tween := create_tween()
	tween.tween_property(spark, "scale", Vector3.ONE * 3.0, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(mat, "albedo_color:a", 0.0, 0.14)
	tween.parallel().tween_property(spark, "position:y", 0.25, 0.14)
	tween.tween_callback(spark.queue_free)

func unequip_shield() -> void:
	if equipped_shield:
		equipped_shield.queue_free()
		equipped_shield = null

func _load_animations() -> void:
	var anim_library = AnimationLibrary.new()

	var animations = {
		"idle": "res://Assets/Base/Maximo_Animations/Sword_And_Shield_Idle.fbx",
		"walk": "res://Assets/Base/Maximo_Animations/Standard_Walk.fbx",
		"run": "res://Assets/Base/Maximo_Animations/Standard_Running.fbx",
		"attack": "res://Assets/Base/Maximo_Animations/Stable_Sword_Outward_Slash.fbx"
	}

	for key in animations:
		var lib = load(animations[key]) as AnimationLibrary
		if lib:
			var list = lib.get_animation_list()
			if list.size() > 0:
				var anim = lib.get_animation(list[0])
				if key != "attack":
					anim.loop_mode = Animation.LOOP_LINEAR
				anim_library.add_animation(key, anim)

	animation_player.add_animation_library("", anim_library)

func _physics_process(delta: float) -> void:
	if not is_attacking:
		_handle_rotation(delta)
		_handle_movement(delta)
	_apply_gravity(delta)
	move_and_slide()
	_update_camera(delta)
	if _swing_can_hit:
		_check_swing_hits()
	if not is_attacking:
		_update_animation()

func _update_camera(delta: float) -> void:
	if not camera_rig or not camera_yaw:
		return
	camera_rig.global_position = global_position
	if auto_face_camera and is_attacking == false and velocity.length() > 0.25:
		var cam_forward: Vector3 = -camera_yaw.global_transform.basis.z
		cam_forward.y = 0.0
		if cam_forward.length_squared() > 0.0001:
			cam_forward = cam_forward.normalized()
			var target_yaw: float = atan2(-cam_forward.x, -cam_forward.z)
			var yaw_diff := wrapf(target_yaw - rotation.y, -PI, PI)
			rotate_y(clampf(yaw_diff, -face_camera_speed * delta, face_camera_speed * delta))

func _handle_rotation(delta: float) -> void:
	var rotation_input: float = 0.0

	if Input.is_action_pressed("move_left"):
		rotation_input -= 1.0
	if Input.is_action_pressed("move_right"):
		rotation_input += 1.0

	rotate_y(-rotation_input * rotation_speed * delta)

func _handle_movement(delta: float) -> void:
	var input_dir: Vector2 = Vector2.ZERO

	if Input.is_action_pressed("move_forward"):
		input_dir.y += 1.0
	if Input.is_action_pressed("move_backward"):
		input_dir.y -= 1.0

	input_dir = input_dir.normalized()

	var is_running: bool = Input.is_action_pressed("run")
	var current_speed: float = run_speed if is_running else walk_speed

	var forward: Vector3 = -transform.basis.z
	var right: Vector3 = transform.basis.x

	var move_dir: Vector3 = (forward * input_dir.y + right * input_dir.x).normalized()

	if move_dir != Vector3.ZERO:
		velocity.x = move_dir.x * current_speed
		velocity.z = move_dir.z * current_speed
	else:
		velocity.x = move_toward(velocity.x, 0, current_speed * delta * 10.0)
		velocity.z = move_toward(velocity.z, 0, current_speed * delta * 10.0)

func _apply_gravity(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0.0

func _update_animation() -> void:
	var new_animation: String = ""

	if not is_on_floor():
		new_animation = "idle"
	elif velocity.length() > 0.1:
		var is_running: bool = Input.is_action_pressed("run")
		if is_running:
			new_animation = "run"
		else:
			new_animation = "walk"
	else:
		new_animation = "idle"

	if new_animation != current_animation:
		current_animation = new_animation
		_play_animation(new_animation)

func _play_animation(anim_name: String) -> void:
	if animation_player and animation_player.has_animation(anim_name):
		animation_player.play(anim_name)

func _on_animation_finished(anim_name: String) -> void:
	if anim_name == "attack":
		is_attacking = false
		current_animation = ""
		_swing_can_hit = false
		_update_animation()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		if camera_yaw:
			camera_yaw.rotate_y(-event.relative.x * mouse_sensitivity)
		if camera_pitch:
			camera_pitch.rotate_x(-event.relative.y * mouse_sensitivity)
			camera_pitch.rotation.x = clamp(camera_pitch.rotation.x, camera_pitch_min, camera_pitch_max)

	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

	if event.is_action_pressed("attack") and not is_attacking:
		is_attacking = true
		current_animation = "attack"
		velocity.x = 0
		velocity.z = 0
		_play_animation("attack")
		_swing_can_hit = false
		get_tree().create_timer(swing_hit_start).timeout.connect(_arm_swing)
