extends Node3D

@export var follow_speed: float = 10.0
@export var distance: float = 3.0
@export var height: float = 1.5

@onready var spring_arm: SpringArm3D = $SpringArm3D

func _ready() -> void:
	if spring_arm:
		spring_arm.spring_length = distance
		spring_arm.position.y = height

func _process(delta: float) -> void:
	pass
