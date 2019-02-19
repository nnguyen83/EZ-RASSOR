#!/usr/bin/env python

import rospy
import math
import numpy as np 
import cv2
from cv_bridge import CvBridge, CvBridgeError 
from stereo_msgs.msg import DisparityImage
import std_msgs
import matplotlib.pyplot as plt

# Written by Tyler Duncan
# The following code assumes Gazebo to be running and the EZ-RASSOR executing the following scripts:
#
#**************************************************************************************************
#
#   ROS_NAMESPACE=ez_rassor/front_camera rosrun stereo_image_proc stereo_image_proc
#
#   rosrun image_view stereo_view stereo:=ez_rassor/front_camera image:=image_rect
#
#**************************************************************************************************
#    These scripts utilize the Disparity map generation provided by ROS out of the box using the 
#    stereo_image_proc package.  So far this has returned the fastest disparity map generation.  



#==================================================================================================
# TODO: I need to figure out how to get the disparityImage message in such a way 
#         that I can use the focal length value, baseline value, and disparity matrix
#        values to calculate a distance matrix. 
#        
#        Z[i][j] = fT / d[i][j], where
#        
#        -    Z[i][j] = the distance to pixel (i, j) 
#        -    f = focal distance 
#        -    T = baseline 
#        -    d = disparity value of pixel (i, j). 
#
#        Numpy.reciprocal will invert all entries in the disparity matrix and then we simply need to
#        multiply by fT on each entry to get depth information. 
#===================================================================================================


def callback(data):
    # Testing Subscription. 
    # rospy.loginfo(rospy.get_caller_id() + "The camera focal length is " + str(data.f))


    bridge = CvBridge()
    cv_image = bridge.imgmsg_to_cv2(data.image, "8UC1").astype("float64")
    
    depth_mat = np.multiply((data.f * data.T), np.reciprocal(cv_image.astype("float64")))
    print(size(depth_mat))
    plt.matshow(depth_mat)
    plt.savefig('image.png')


    max_arr = depth_mat.min(0)
    rows, cols = depth_mat.shape

    
    div_mat = np.split(depth_mat, 2)




    # if max_left.mean > max_right.mean:
    #     print("MOVE RIGHT!")
    # elif max_left.mean < max_right.mean:
    #     print("MOVE LEFT!") 

def depth_estimator():

    rospy.init_node('depth_estimator')
    rospy.Subscriber("/ez_rassor/front_camera/disparity", DisparityImage, callback)
    rospy.spin()

if __name__ == "__main__":
    try:
        depth_estimator()
    except ROSInterruptException:
        pass