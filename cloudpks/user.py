import os
import logging
from cloudpks import RestClient

logging.basicConfig(level=os.getenv('vke_log_level'),
                    format='%(asctime)s %(name)s %(levelname)s %(message)s'
                    )
logger = logging.getLogger(__name__)
logging.getLogger('requests').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)

class User(object):
    """
    This is inspired by work from Grant 
    The user and organisation management runs through the centralised
    Cloud Services Portal and as such, we use a different baseurl for
    this module when compared with the other modules.
    """

    def __init__(self, server, api_key, auth_token):
        self._server = server
        self._api_key = api_key
        self.header = {
            'Content-Type': "application/json",
            'csp-auth-token': auth_token
        }

    def remove(self, session, id, username):
        payload = {
            "emails": username
        }
        logger.debug(f'Payload: {payload}')
        response = session.do_patch(self._server, self.header, f'{id}/users/', payload, 'DISCOVERY')
        return response

    def invite(self, session,
               id,
               usernames,
               org_role='org_member',
               vke=False
               ):
        payload = {
            'usernames': usernames,
            'orgRoleName': org_role,
            'serviceRolesDtos': []
        }
        if vke:
            payload['serviceRolesDtos'].append({
                'serviceDefinitionLink': ('/csp/gateway/slc/api/definitions'
                                          '/external'
                                          '/o3ecbsAvjpw6lmL3aliJX29zVhE_'
                                          ),
                'serviceRoleNames':
                    [
                        'vke:service-user'
                    ]
            })

        logger.debug(f'Payload: {payload}')
        response = session.do_post(self._server, self.header, f'{id}/invitations', payload, 'DISCOVERY')
        return response

    def list(self, session, id):
        return session.do_get(self._server, self.header, f'{id}/users/', 'DISCOVERY')
