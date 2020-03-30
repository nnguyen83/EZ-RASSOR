import rospy
import sys

from std_msgs.msg import Int8, Int16, String
from geometry_msgs.msg import Point
from nav_msgs.msg import Odometry
from gazebo_msgs.msg import LinkStates
from sensor_msgs.msg import JointState
from sensor_msgs.msg import Imu
import actionlib

from ezrassor_swarm_control.msg import waypointAction, waypointResult
from ezrassor_swarm_control.srv import GetRoverStatus, GetRoverStatusResponse

import ai_objects as obj
import auto_functions as af
import utility_functions as uf
import nav_functions as nf

import re

class RoverController:
    def __init__(self, target_x, target_y, movement_topic, front_arm_topic,
                 back_arm_topic, front_drum_topic, back_drum_topic,
                 max_linear_velocity, max_angular_velocity,
                 real_odometry, swarm_control):

        self.namespace = rospy.get_namespace()

        # Create Utility Objects
        self.world_state = obj.WorldState()
        self.ros_util = obj.ROSUtility(movement_topic,
                                       front_arm_topic,
                                       back_arm_topic,
                                       front_drum_topic,
                                       back_drum_topic,
                                       max_linear_velocity,
                                       max_angular_velocity)

        # Setup Subscriber Callbacks
        if real_odometry:
            # This topic will be changed to represent whatever
            # topic the odometry data is being published to
            rospy.Subscriber('stereo_odometer/odometry',
                             Odometry,
                             self.world_state.odometryCallBack)
        else:
            rospy.Subscriber('/gazebo/link_states',
                             LinkStates,
                             self.world_state.simStateCallBack)

        rospy.Subscriber('imu',
                         Imu,
                         self.world_state.imuCallBack)
        rospy.Subscriber('joint_states',
                         JointState,
                         self.world_state.jointCallBack)
        rospy.Subscriber('obstacle_detect',
                         Int8,
                         self.world_state.visionCallBack)
        rospy.Subscriber('autonomous_toggles',
                         Int8,
                         self.ros_util.autoCommandCallBack)

        if swarm_control:
            # Create waypoint action server used to control the rover via the swarm_controller
            self.server_name = 'waypoint'
            self.waypoint_server = actionlib.SimpleActionServer(self.server_name, waypointAction,
                                                              execute_cb=self.move_rover, auto_start=False)

            self.waypoint_server.start()

            rospy.loginfo('Rover waypoint server initialized.')

            self.status_service = rospy.Service('rover_status', GetRoverStatus, self.send_status)
            rospy.loginfo('Rover status service initialized.')

            rospy.loginfo("TARGET X AND TARGET Y: {} {}".format(target_x, target_y))

        else:
            # Basic autonomous control using the autonomous control loop
            target_location = Point()
            temp = Point()

            target_location.x = target_x
            target_location.y = target_y

            temp.x = target_x
            temp.y = target_y

            self.world_state.target_location = target_location
            self.world_state.dig_site = temp

    def move_rover(self, goal):
        """
        Callback executed when the swarm controller sends a goal to a rover via the
        rover's waypoint client-server API
        """

        # Check that goal has not been preempted by the client
        if uf.preempt_check(self.waypoint_server):
            return

        self.world_state.target_location = goal.target

        rospy.loginfo('Waypoint server {} moving rover to {}'.format(
            self.namespace + self.server_name, (goal.target.x, goal.target.y)))

        # Set rover to autonomously navigate to target
        feedback = af.auto_drive_location(self.world_state, self.ros_util, self.waypoint_server)

        # Publish result
        result = waypointResult()
        result.final_pose = feedback.current_pose

        # Send resulting rover pose
        rospy.loginfo("position: ({}, {})".format(self.world_state.positionX, self.world_state.positionY))
        # rospy.loginfo("dig site location: ({}, {})".format(self.world_state.dig_site.x, self.world_state.dig_site.y))
        # if nf.euclidean_distance(self.world_state.positionX, self.world_state.dig_site.x, self.world_state.positionY, self.world_state.dig_site.y) <= 1.0 :
        #     rospy.loginfo("WE HERE!!!!!")
        self.waypoint_server.set_succeeded(result)

    def send_status(self, request):
        """
        Sends the rover's current battery and pose to the swarm controller
        """

        status = GetRoverStatusResponse()
        status.pose.position.x = self.world_state.positionX
        status.pose.position.y = self.world_state.positionY
        status.pose.position.z = self.world_state.positionZ
        status.pose.orientation = self.world_state.orientation
        status.battery = self.world_state.battery

        # rospy.loginfo('Service {} sending current status'.format(
        #                 self.status_service.resolved_name))

        return status

    def full_autonomy(self, world_state, ros_util):
        """ Full Autonomy Loop Function """

        rospy.loginfo('Full autonomy activated.')

        while (ros_util.auto_function_command == 16):
            af.auto_drive_location(world_state, ros_util)
            if ros_util.auto_function_command != 16:
                break
            af.auto_dig(world_state, ros_util, 7)
            if ros_util.auto_function_command != 16:
                break
            af.auto_dock(world_state, ros_util)
            if ros_util.auto_function_command != 16:
                break
            af.auto_dump(world_state, ros_util, 4)
            world_state.target_location.x = world_state.dig_site.x
            world_state.target_location.y = world_state.dig_site.y

        world_state.target_location.x = world_state.dig_site.x
        world_state.target_location.y = world_state.dig_site.y

    def autonomous_control_loop(self, world_state, ros_util):
        """ Control Auto Functions based on auto_function_command input. """

        while (True):
            while ros_util.auto_function_command == 0 or ros_util.auto_function_command == 32:
                ros_util.publish_actions('stop', 0, 0, 0, 0)
                ros_util.rate.sleep()

            ros_util.control_pub.publish(True)

            if ros_util.auto_function_command == 1:
                af.auto_drive_location(world_state, ros_util)
            elif ros_util.auto_function_command == 2:
                af.auto_dig(world_state, ros_util, 10)
            elif ros_util.auto_function_command == 4:
                af.auto_dump(world_state, ros_util, 4)
            elif ros_util.auto_function_command == 8:
                af.auto_dock(world_state, ros_util)
            elif ros_util.auto_function_command == 16:
                self.full_autonomy(world_state, ros_util)
            else:
                rospy.loginfo('Invalid auto-function request: %s.',
                              str(ros_util.auto_function_command))

            ros_util.auto_function_command = 0
            ros_util.publish_actions('stop', 0, 0, 0, 0)
            ros_util.control_pub.publish(False)


def on_start_up(target_x, target_y, movement_topic, front_arm_topic,
                back_arm_topic, front_drum_topic, back_drum_topic,
                max_linear_velocity=1, max_angular_velocity=1,
                real_odometry=False, swarm_control=False):
    """ Initialization Function  """

    # ROS Node Init Parameters 
    rospy.init_node('autonomous_control', anonymous=True)

    rover_controller = RoverController(target_x, target_y, movement_topic, front_arm_topic,
                                       back_arm_topic, front_drum_topic, back_drum_topic,
                                       max_linear_velocity, max_angular_velocity,
                                       real_odometry, swarm_control)

    # Start autonomous control loop if rover isn't being controlled by a swarm controller
    if not swarm_control:
        rover_controller.autonomous_control_loop(rover_controller.world_state,
                                                 rover_controller.ros_util)

        rospy.loginfo('Autonomous control initialized.')
