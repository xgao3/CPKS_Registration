pipeline {
  agent {
    kubernetes {
        label 'docker-build-pod'
        yamlFile 'podTemplate/jw-workshop-docker-build.yaml'
    }
  }
  stages {
    stage('Docker Build') {
      steps {
        container('docker'){
          sh 'docker build -t xiaog/vke-cluster-register.v2.latest .'
        }
      }
    }
    stage('Docker Push') {
      steps {
        container('docker'){
          withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
            sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
            sh 'docker push xiaog/vke-cluster-register.v2.latest'
          }
        }
      }
    }
    stage('Deploy to CloudPKS cluster') {
      steps {
        container('vke-kubectl'){
          withCredentials([usernamePassword(credentialsId: 'VCS', usernameVariable: 'orgID', passwordVariable: 'apiToken')]) {
            sh "vke account login -t ${env.orgID} -r ${env.apiToken}"
            sh '''
                 vke cluster merge-kubectl-auth cluster1010101431
		 kubectl delete deployment vke-app -n vke-app || true
                 sleep 5
		 kubectl create -n vke-app -f deployFiles/temp3.yaml
                 echo "Node Server Launched!"
            '''
          }
        }
      }
    }
  }
}
