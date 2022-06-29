# NoobAuth

This project is a simple OAuth2 implementation server in NodeJS, supports [authorization code](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-31#section-1.3.1) grant type only.

NoobAuth supports Single Sign On (SSO) as well, some features are delivered based on my knowledge about [Keycloak](https://github.com/keycloak/keycloak).

## Tech stack

* NodeJS, Express are the main webserver components;
* EJS is the view engine, we need for login/logout views.
* [Nedb](https://github.com/louischatriot/nedb) - the embedded database - is used for fast and simple development. If you want to use a different database, you can adapt by changing code in the ```repositiory``` directory.

## Basic concepts

![basic entities](https://www.linkpicture.com/q/entities.png)

* ``realm``: the top entity that users, clients are belonged to; has its own configurations
* ``user``: resource owner
* ``client``: client (webapp, native app, SPA app,...)
* ``user_session``: holds user's authorization grant, for SSO purpose
* ``client_session``: holds client's authorized request, for SSO purpose
* ``access_token``: jwt, generate with RS256 algorithm
* ``refresh_token``: revoke immediately after using
* ``auth_code``: authorization code granted to client. ```auth_code = request_http_session_id + user_session_id + client_session_id```

### Other entities

* ``server_session``: the cookie for user-agent (web browser), for SSO purpose. ```server_session = realm_name + request_http_session_id + authenticated_user_id```
* ``metadata``: well-known configurations and key/cert information used.

## Getting started
To run NoobAuth, from the root directory of this project, run:
* ```npm install```
* ```node index.js```

You have to initialize realm, client and user before doing OAuth2 features. You can setup you environment with the ```test/test.js``` file:
* ```testCreateRealm```, ```testCreateClient``` and ```testCreateUser``` are the basic functions can help.

# OAuth2 implementation

## Grant type 

Authorization Code, if you want to implement other flows such as: Implicit, Client Credentials, Resource Owner Password Credentials, do it by yourself.

So ```grant_type``` supported are: ```authorization_code``` and ```refresh_token```.

```response_type``` supports only ```code``` (for ```authorize``` endpoint)

## Endpoints

* Authorize Endpoint: /oauth2/{realm}/authorize
* Token Endpoint: /oauth2/{realm}/token
* UserInfo Endpoint: /oauth2/{realm}/userinfo
* Logout Endpoint: /oauth2/{realm}/logout
* Metadata Endpoint: /oauth2/{realm}/metadata
* JWKs URI: /oauth2/{realm}/certs

with ```{realm}``` is the realm name you setup before. 

# Single Sign On (SSO)

For SSO feature, cookies ```noob-session``` and ```request-session``` are used in the web browsers, to define the user-session logged in.

### Demo clients

Checkout:
* Java (Spring-boot application): [noobauth-java-client](https://github.com/chenhuang511/noobauth-java-client)
* NetCore: [noobauth-net-client](https://github.com/chenhuang511/noobauth-net-client)
* PHP: [noobauth-php-client](https://github.com/chenhuang511/noobauth-php-client)

# TODOs

* Implement with a distributed database server, for high availability support, such as: MariaDB;
* ``force_tls`` as a client option, for secured redirections.
* ``Authorized workflow``: Display a page show access request from clients. Users have to confirm here before go to the login page.
* ``Management APIs`` for realms, configurations, clients management.
* ``Idp APIs`` for users, roles, scopes management.

# License
MIT