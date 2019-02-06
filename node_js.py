from cloudpks import RestClient, User, VKE, VkeCluster
import requests
import argparse
import json
import time
import os

SERVER = 'api.mgmt.cloud.vmware.com'
CONSOLE = 'console.cloud.vmware.com'
VKE_API_ENDPOINT= "api.vke.cloud.vmware.com"
VKE_AUTH_ENDPOINT = "lightwave.vke.cloud.vmware.com"

def getargs():
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--token',
                        required=True,
                        action='store'
    )
    parser.add_argument('-o', '--org_id',
                        required=True,
                        action='store'
    )
    parser.add_argument('-u', '--user',
                        required=True,
                        action='store'
    )
    parser.add_argument('-a', '--add',
                        required=False,
                        action='store'
    )
    parser.add_argument('-c', '--cluster',
                       required=False,
                       action='store'
    )
    args = parser.parse_args()
    return args


def invite_user(session,
                user,
                api_token,
                org_id,
                vke=False):
    user_i = User(CONSOLE, api_token, session._auth)
    user_i.invite(session,
                id=org_id,
                usernames=user,
                vke=vke)

def remove_user(session, org_id, username, api_token):
    user_i = User(CONSOLE, api_token, session._auth)
    user_i.remove(session,
                id=org_id,
                username=username
                )

def list_user(session, api_token, org_id):
    user_i = User(CONSOLE, api_token, session._auth)
    user_i.list (session, org_id)

def cancel_active_requests(session):
    while len(Request.list_incomplete(session)) > 0:
        for i in Request.list_incomplete(session):
            Request.cancel(session, i['id'])
            time.sleep(10)
    return


def exchange_api_token (session, refresh_token, org_id): 
    VKE_i = VKE(VKE_AUTH_ENDPOINT, refresh_token, session._auth, session, org_id)
    return VKE_i

def vke_cluster_init (session, org_id, api_token, region, foldername, projectname, clustername):
    vke_cluster = VkeCluster(VKE_API_ENDPOINT, 
                             api_token, 
                             org_id, 
                             region,
                             foldername,
                             projectname,
                             clustername)
    return vke_cluster

def assign_vke_cluster_id (vke_i, session, org_id, cluster_id, email_id):
    vke_i.add_cluster_iam(session, org_id, cluster_id, email_id)

def main():
    args = getargs()
    print (f" arguments are: {args}")
    session = RestClient(SERVER, args.token)
    users= args.user.split()
    if args.add is not None:
        invite_user(session,
                    user=users,
                    api_token=args.token,
                    org_id=args.org_id,
                    vke=True)
    else:
        remove_user(session,
                    org_id=args.org_id,
                    username=users,
                    api_token=args.token)


    if args.cluster is not None: 
        vke_i = exchange_api_token (session, args.token, org_id=args.org_id)
        vke_cluster = vke_cluster_init (session, 
                                       args.org_id, 
                                       vke_i._acquire_csp_api_token(session, args.org_id),
                                       "us-west-2",
                                       "viouserfolder",
                                       "viouservmware1223115222",
                                       "args.cluster") 
        cluster_id = vke_cluster.get_cluster_id(session, args.org_id, args.cluster)
        assign_vke_cluster_id (vke_cluster, session, args.org_id, cluster_id, args.user)  
    else:
        pass

if __name__ == '__main__':
    main()
