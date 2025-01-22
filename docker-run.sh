docker stop bpmn-io
docker rm bpmn-io
docker run -d --restart=always --name bpmn-io -p 8080:80 -it bpmn-io:1.5
docker logs bpmn-io