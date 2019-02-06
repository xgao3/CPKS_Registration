import requests
import logging
import json
import os
import sys

logging.basicConfig(level=os.getenv('vke_log_level'),
                    format='%(asctime)s %(name)s %(levelname)s %(message)s'
                    )
logger = logging.getLogger(__name__)
logging.getLogger('requests').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)


class VkeCluster():
    """
     This is the vke cluster implementation based on "requests"
    """
    def __init__(self,
                 server, 
                 api_token, 
                 org_id, 
                 region_id, 
                 foldername, 
                 projectname, 
                 clustername):
        """ 
          set the remote server IP and other properties of the cluster
        """
        self._vke_api_endpoint = server
        self._vke_api_token = api_token
        self._cluster_name = clustername
        self._region = region_id
        self._folderName = foldername
        self._projectName = projectname
        self.header = {
             'Authorization': f"Bearer {api_token}",
             'cache-control': "no-cache",
             'Content-Type': "application/json"

        } 

    def create_cluster (self, 
                        session, 
                        org_id):
        api_token = self._vke_api_token
        logger.debug(f'header: {self.header}') 
        payload = {
                        "name": f"{self._cluster_name}",
                        "displayName": f"{self._cluster_name}",
                        "folderName": f"{self._folderName}",
                        "projectName": f"{self._projectName}",
                        "serviceLevel": "DEVELOPER",
                        "repositoryId": "default",
                        "networking": {
                           "clusterNetworkCidr": "10.1.0.0/16",
                           "networkTenancy": "SHARED",
                           "podNetworkCidr": "10.2.0.0/16",
                           "serviceNetworkCidr": "10.0.0.0/24"
                        },
                        "version": "1.11.5-1"
                   }

        response = session.do_post(self._vke_api_endpoint, 
                                   self.header, 
                                   f'{org_id}/clusters/?region={self._region}',
                                   payload,
                                   'VKE_CLUSTER')
        if response.status_code != 202:
            logger.error('Failed to CreateCluster.')
            logger.error(f'Error message {response.json()["message"]}',
                             exc_info=False)
            sys.exit(1)


    def delete_cluster (self, 
                        session, 
                        org_id,cluster_id):
        api_token = self._vke_api_token
        logger.debug(f'header: {self.header}')
        response = session.do_delete(self._vke_api_endpoint,
                                     self.header,
                                     f'{org_id}/clusters/{cluster_id}',
                                     'VKE_CLUSTER')
        if response.status_code != 202:
            logger.error('Failed to Delete.')
            logger.error(f'Error message {response.json()["message"]}',
                             exc_info=False)
            sys.exit(1)

    @staticmethod
    def name_to_id(response, cluster_name): 
        cluster_id = None
        for i in range (0, len(response.json()['items'])):
            if (response.json()['items'][i]['displayName'] == cluster_name):
                cluster_id = response.json()['items'][i]['id']
                logger.debug(f'Cluster Name {cluster_name} has ID : {cluster_id}')
        if cluster_id != None:
            return cluster_id
        else:
            logger.error('Invalid cluster or Cluster does not exist')
            sys.exit(1)


    def get_cluster_id(self, 
                       session, 
                       org_id, 
                       cluster_name):
        api_token = self._vke_api_token
        logger.debug(f'header: {self.header}')
        response = session.do_get(self._vke_api_endpoint, 
                                  self.header, 
                                  f'{org_id}/clusters', 
                                  'VKE_CLUSTER')

        if response.status_code != 200:
            logger.error('Failed to list cluster.')
            logger.error(f'Error message {response.json()["message"]}',
                             exc_info=False)
            sys.exit(1)
        else: 
            cluster_id = self.name_to_id (response, cluster_name)
            return cluster_id

    def add_cluster_iam(self, 
                        session, 
                        org_id, 
                        cluster_id, 
                        email_id):
        api_token = self._vke_api_token
        payload = {
                      "bindingDeltas": [
                          {
                             "action": "ADD",
                             "subject": f"{email_id}",
                             "role": "smartcluster.admin"
                          },
                          {
                             "action": "ADD",
                             "subject": f"{email_id}",
                             "role": "smartcluster.edit"
                          }
                      ]
                  }
        logger.debug(f'header and Payload: {self.header} with payload {payload}')
        response = session.do_patch(self._vke_api_endpoint, 
                                    self.header, 
                                    f'{org_id}/clusters/{cluster_id}/iam', 
                                    payload, 
                                    'VKE_CLUSTER') 
         
        if response.status_code != 200:
            logger.error('Failed to patch cluster.')
            logger.error(f'Error message {response.json()["message"]}',
                             exc_info=False)
            sys.exit(1)
