import requests
import os
import logging
import yaml
import json


logging.basicConfig(level=os.getenv('vke_log_level'),
                    format='%(asctime)s %(name)s %(levelname)s %(message)s'
                    )
logger = logging.getLogger(__name__)
logging.getLogger('requests').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)


class VKE():
    """
     This is the client implementation based on "requests"
    """
    def __init__(self, server, api_key, auth_token, session, org_id):
        """ 
          set the remote server IP and API key
        """
        self._vke_api_endpoint = server
        self._vke_refresh_token = api_key
        self.header = {
             'Content-Type': "application/x-www-form-urlencoded",
             'cache-control': "no-cache"
        }
        self._vke_access_token = auth_token
        self._vke_api_token = self._acquire_csp_api_token(session, org_id)

    def _acquire_csp_api_token (self, session, org_id):
        auth_token=self._vke_access_token
        payload = f"grant_type=urn%3Avmware%3Agrant_type%3Afederation_token" \
                  f"&access_token={auth_token}" \
                  f"&scope=openid%20offline_access%20rs_admin_server%20at_groups%20id_groups%20rs_vmdir"

        logger.debug(f'header and Payload: {self.header} with payload {payload}')
        response = session.do_post(self._vke_api_endpoint, self.header, f'{org_id}', payload, 'API_TOKEN')
        auth = response.json()['access_token']
        logger.debug(f'auth token is {auth}')
        return auth

