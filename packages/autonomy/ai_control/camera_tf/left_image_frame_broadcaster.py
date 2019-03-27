#!/usr/bin/env python
import rospy
import tf


if __name__ == "__main__":
	rospy.init_node('left_image_frame_broadcaster')
	camera_left = tf.TransformBroadcaster()
	camera_depth = tf.TransformBroadcaster()
	map = tf.TransformBroadcaster()
	odom = tf.TransformBroadcaster()
	rate = rospy.Rate(10.0)
	while not rospy.is_shutdown():
		camera_left.sendTransform((1.0, 0.035, 0.0), (-0.5, 0.5, -0.5, 0.5), rospy.Time.now(), "left_camera_optical_frame","base_link")
		camera_left.sendTransform((1.0, 0.035, 0.0), (0.0, 0.0, 0.0, 1.0), rospy.Time.now(), "camera_depth_frame","base_link")
		map.sendTransform((0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 1.0), rospy.Time.now(), "odom","map")
		rate.sleep()