import requests
import os
import logging
import yaml
import json
from string import Template

logging.basicConfig(level=os.getenv('vke_log_level'),
                    format='%(asctime)s %(name)s %(levelname)s %(message)s'
                    )
logger = logging.getLogger(__name__)
logging.getLogger('requests').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)


class RestClient():
    """
     This is the client implementation based on "requests"
    """
    _URL_TEMPLATE_PREFIX = Template('https://$server/iaas/$uri')

    _URL_DISCOVERY_PREFIX = Template('https://$server/csp/gateway/am/api/orgs/$uri')
   
    _URL_CSP_ENDPOINT = Template('https://$server/openidconnect/token/$uri')

    _URL_VKE_Cluster = Template('https://$server/v1/orgs/$uri')

    def __init__(self, server, api_key):
        """ 
          set the remote server IP and API key
        """
        self._server = server
        self._api_key = api_key
        self.headers = {'accept': "application/json",
                        'Content-Type': "application/json",
                        'Cache-Control': "no-cache"}
        self._session = requests.Session()
        self._auth = self._do_login_bearer_token('login')
        
    def _generic_iaas_url(self, path):
        # TO DO. use .split() path
        generic_path = path
        return self._URL_TEMPLATE_PREFIX.substitute(server=self._server, uri=generic_path)

    def _generic_discovery_url(self, path, server):
        # TO DO. use .split() path
        generic_path = path 
        return self._URL_DISCOVERY_PREFIX.substitute(server=server, uri=generic_path)

    def _get_url(self, server, path, template_type):
        """
         Attributes:
             server: IP endpoint for an API call. 
             path: String - used to compose service specific URI.
             template_type: Service definition - used to return the URL template
        """
        if (template_type == "IAAS"):
          url = self._generic_iaas_url(path)
        elif (template_type == "API_TOKEN"):
          url = self._URL_CSP_ENDPOINT.substitute(server=server, uri=path)
        elif (template_type == "VKE_CLUSTER"):
          url = self._URL_VKE_Cluster.substitute(server=server,uri=path)
        else:
          url = self._generic_discovery_url(path,server)
        return url


    def _do_login_bearer_token(self, path):
        """
         Attributes:
             path: String used to compose service specific URI
        """
        url = self._generic_iaas_url(path)
        payload = { 'refreshToken': str(self._api_key) }
        headers = self.headers    
        logger.debug(f'POST to:{url} '
                         f'with headers: {headers} '
                         f'and body: {payload}.'
                         ) 

        try:
            r = self.do_post(self._server, headers, path, payload, 'IAAS')
            logger.debug(f'Response: {r.json()}')
            auth = r.json()['token']
            return auth
        except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            logger.error('Failed to POST')
            logger.error(f'Error message {r.json()["message"]}',
                             exc_info=False)


    def do_get(self, server, headers, path, template_type):
        url = self._get_url(server, path, template_type)
        headers = headers
        logger.debug(f'GET to: {url} '
                         f'with headers: {headers} '
                         )
        try:
            response = self._session.get(url, headers=headers)
            logger.debug(f'Response: {response.json()}')
            return response
        except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            logger.error('Failed to Get')
            logger.error(f'Error message {response.json()["message"]}',
                             exc_info=False)


    def do_post(self, server, headers, path, data, template_type):
        url = self._get_url(server, path, template_type)
        if type(data) == dict:
          data = json.dumps(data)
        headers = headers
        logger.debug(f'POST to: {url} '
                         f'with headers: {headers} '
                         f'and body: {data}.'
                         )
        try:
            response = self._session.post(url, data, headers=headers)
            logger.debug(f'Response: {response.json()}')
            return response
        except requests.exceptions.RequestException as e:  # This is the correct syntax
            logger.error(f'Failed to Post : {e}.')
            logger.error(f'Error message {r.json()["message"]}',
                             exc_info=False)
            sys.exit(1)

    def do_delete(self, server, headers, path, template_type):
        url = self._get_url(server, path, template_type)
        headers = headers
        logger.debug(f'POST to: {url} '
                         f'with headers: {headers} '
                         )
        try:
            response = self._session.delete(url, headers=headers)
            logger.debug(f'Response: {response.json()}')
            return response
        except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            logger.error('Failed to authorize.')
            logger.error(f'Error message {r.json()["message"]}',
                             exc_info=False)

    def do_patch(self, server, headers, path, data, template_type):
        url = self._get_url(server, path, template_type)
        if type(data) == dict:
          data = json.dumps(data)
        logger.debug(f'Patch to: {url} '
                         f'with headers: {headers} '
                         f'and body: {data}.'
                         )
        try:
            response = self._session.patch(url, data, headers=headers)
            logger.debug(f'Response: {response.json()}')
            return response
        except requests.exceptions.RequestException as e:  # This is the correct syntax
            logger.error(f'Failed to Post : {e}.')
            logger.error(f'Error message {r.json()["message"]}',
                             exc_info=False)
            sys.exit(1)
 
