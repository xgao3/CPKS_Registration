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
          sh 'docker build -t xiaog/web-workshop:latest .'
        }
      }
    }
    stage('Docker Push') {
      steps {
        container('docker'){
          withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
            sh "echo ${env.dockerHubUser} ${env.dockerHubPassword}"
            sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
            sh 'docker push xiaog/web-workshop:latest'
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
                 vke cluster auth setup xgao-cluster
		 kubectl delete deployment vke-app -n web-workshop || true
                 sleep 5
		 kubectl create -n web-workshop -f deployFiles/temp3.yaml
                 echo "Node Server Launched!"
            '''
          }
        }
      }
    }
  }
}
