extends StaticBody3D

@export_group("Bag Tuning")
@export var max_health: int = 30
@export var base_color: Color = Color(0.55, 0.5, 0.42)
@export var band_color: Color = Color(0.36, 0.31, 0.26)
@export var flash_color: Color = Color(1.0, 0.35, 0.35)
@export var flash_duration: float = 0.09
@export var squash_amount: float = 0.12
@export var knockback_distance: float = 0.15
@export var respawn_after_death: bool = true

var health: int
var start_position: Vector3
var _dead: bool = false
var _meshes: Array[MeshInstance3D] = []
var _mats: Array[StandardMaterial3D] = []
var _flash_mat: StandardMaterial3D

func _ready() -> void:
	health = max_health
	start_position = position
	_setup_materials()

func _setup_materials() -> void:
	_flash_mat = StandardMaterial3D.new()
	_flash_mat.albedo_color = flash_color
	_flash_mat.roughness = 0.6
	for child in get_children():
		if child is MeshInstance3D:
			var mat := StandardMaterial3D.new()
			mat.albedo_color = band_color if String(child.name).begins_with("Strap") else base_color
			mat.roughness = 0.8
			child.material_override = mat
			_meshes.append(child)
			_mats.append(mat)

func take_damage(amount: int, hit_dir: Vector3 = Vector3.FORWARD) -> void:
	if _dead:
		return
	health = max(0, health - amount)
	_play_flash()
	_play_squash()
	_play_knockback(hit_dir)
	print("[BAG] hp %d/%d" % [health, max_health])
	if health <= 0:
		_die()

func _play_flash() -> void:
	for mesh in _meshes:
		mesh.material_override = _flash_mat
	get_tree().create_timer(flash_duration).timeout.connect(_restore_materials)

func _restore_materials() -> void:
	for i in _meshes.size():
		_meshes[i].material_override = _mats[i]

func _play_squash() -> void:
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector3(1.0 - squash_amount, 1.0 + squash_amount, 1.0 - squash_amount), 0.06)
	tween.tween_property(self, "scale", Vector3.ONE, 0.28).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)

func _play_knockback(hit_dir: Vector3) -> void:
	if hit_dir == Vector3.ZERO:
		return
	var dir := hit_dir
	dir.y = 0.0
	if dir.length_squared() < 0.0001:
		dir = -transform.basis.z
	dir = dir.normalized()
	var target := start_position + dir * knockback_distance
	var tween := create_tween()
	tween.tween_property(self, "position", target, 0.12)
	tween.tween_property(self, "position", start_position, 0.3).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(self, "rotation_degrees", Vector3(0, 0, dir.x * 6.0), 0.12)

func _die() -> void:
	_dead = true
	var tween := create_tween()
	tween.tween_property(self, "rotation_degrees", Vector3(0, 0, 78), 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tween.parallel().tween_property(self, "position", position + Vector3(0, -0.15, 0), 0.35)
	if respawn_after_death:
		tween.tween_callback(func() -> void:
			_reset())
	else:
		tween.tween_interval(0.2)
		tween.tween_callback(func() -> void:
			queue_free())

func _reset() -> void:
	_dead = false
	health = max_health
	position = start_position
	rotation = Vector3.ZERO
	scale = Vector3.ONE
	print("[BAG] reset for another round")