# api-server-dev
development for api sever with load balancer and auth

implement auth for api service:
approcah: any client who wants to register will give 2 unique tokens(strings). one is authtoken and other is refresh token.
          token is given by taking email id or username as parameter. while assigning the token, auth service stores the token           information along with email if or username and time limit in database. 
          to use the api server, client should send user info(email/username) along with auth token in headers.
          when ever client sends a request, api server verifies the the username along with the token.
          if its valid token with respect to the username then server goes to next step.
          if not valid response is returned back with invalid token.
          after valid token check server verifies if token has expired or live?
          if live sends the information requested
          else sends error with token expired.
          then client handles this error by sending a request to issue new token with help of auth token and refresh token.
          now server verifies if both tokens are valid with respect to user details and then issues new auth token and new               refresh token and updates into database. and clients send new request with new token.
          
          
load balancer:  first request is received by load balancer, from here load balancer forwards request to 3 api servers one after other.


download the project and go to api-service and run command docker-compose up

now port 5050 is accessible which is load balancer.

first it asks email id and password in headers. we should set headers as email:"enter your email" and pwd:"enter your password" and send request to port 5050.

