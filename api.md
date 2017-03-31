# SketchMyWord API Documentation

## Image API

### Create

- description: create a new user
- request: `PUT /api/users/`
    - content-type: `application/json` 
    - body: object
      - username: (string) the username of this new user
      - password: (string) the password of this new user
- response: 200
    - content-type: `application/json`
    - body: object
        - success: (bool) did this sign up succeed?
- response: 400
    - body: Username $username already exists


``` 
$ curl -X PUT -k \ 
       -H "Content-Type: application/json" \
       -d '{"username":"aaa","password":"aaa"}' \
       https://3honeys.cms-weblab.utsc.utoronto.ca/api/users

```

### Create

- description: sign in to SketchMyWord
- request: `POST /api/signin/`
    - content-type: `application/json` 
    - body: object
      - username: (string) the username of this new user
      - password: (string) the password of this new user
- response: 200
    - content-type: `application/json`
    - body: object
        - success: (bool) did this sign up succeed?
- response: 401
    - body: Sorry, we couldn't find your account
- response: 401
    - body: Unauthorized


``` 
$ curl -X POST -k -c cookie.txt \
    -H "Content-Type: application/json" \
    -d '{"username":"aaa","password":"aaa"}' \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/signin
```

### Create

- description: create a new SketchMyWord game room
- request: `PUT /api/game/`
    - content-type: `application/json`
    - body: object
      - roomSize:  (num) the number of players in this room
- response: 200
    - content-type: `application/json`
    - body: object
      - roomId: (string) the id of the room
- response: 403
    - body: Unauthorized

``` 
$ curl -X PUT -k -b cookie.txt \
       -H "Content-Type: application/json" \
       -d '{"roomSize": "4"}' \
       https://3honeys.cms-weblab.utsc.utoronto.ca/api/game
```

### Create

- description: join an existing SketchMyWord room
- request: `POST /api/game/:roomId
    - content-type: `application/json`
    - param: string
      - roomId: (string) the id of the room to join
- response: 200
    - content-type: `application/json`
    - body: object
        - success: (bool) if you joined this room successfully
- response: 400
    - body: Sorry, this room is full.
- response: 400
    - body: You have already joined this room.
- response: 400
    - body: No room with that id exists.
- response: 403
    - body: Forbidden

``` 
$ curl -X POST -k -b cookie.txt \
       -H "Content-Type: application/json"  \
       https://3honeys.cms-weblab.utsc.utoronto.ca/api/game/FiendishlySuaveSquirrel
```

### Read

- description: get all current games with number of users int hem
- request: `GET /api/game
- response: 200
    - content-type: `application/json`
    - body: object
        - rooms: object
          - roomsWithUsers: array of
            - roomId:   (string) id of this room
            - users:    (array)  array of users
            - roomSize: (num)    size of room 
- response: 403
    - body: Forbidden
 
``` 
$ curl -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/game
```

### Read

- description: retrieve the leaderboard
- request: `GET /api/stats?sort=games_won&limit=10
  - params: 
    - sort (string) sort by any of the fields below
    - limit (num) limit results from 1-10
- body: object
    - array of player objs: 
        - username:      (string) username
        - total_games:   (num) total games of SMW played
        - games_won:     (num) number of SMW games won
        - total_points:  (num) total number of points earned across all games
        - words_guessed: (num) total words guessed
        - high_score:    (num) highest score earned
- response: 403
    - body: Forbidden
 
``` 
$ curl -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/stats?sort=total_games&limit=3
```

### Read

- description: retrieve individual stats
- request: `GET /api/stats/:username`
- response: 200
    - content-type: `application/json`
    - body: object
        - total_games:   (num) total games of SMW played
        - games_won:     (num) number of SMW games won
        - total_points:  (num) total number of points earned across all games
        - words_guessed: (num) total words guessed
        - high_score:    (num) highest score earned
- response: 403
    - body: Forbidden
 
 
``` 
$ curl -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/stats/Vincent
```

### Read

- description: get current status of game
- request: `GET /api/game/:roomId
- response: 200
    - content-type: `application/json`
    - body: object
        - active  total games of SMW played
        - games_won:     (num) number of SMW games won
        - total_points:  (num) total number of points earned across all games
        - words_guessed: (num) total words guessed
        - high_score:    (num) highest score earned
- response: 403
    - body: Forbiddend
 
 
``` 
$ curl -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/stats/Vincent
```

### Read

- description: retrieve the first image in the gallery
- request: `GET /api/images?first`   
- response: 200
    - content-type: `application/json`
    - body: object
        - image: object
            - _id:       (string) the message id
            - user:      (string) the author of this image
            - title:     (string) the title of this image
            - createdAt: (string) date of creation
            - updatedAt: (string) date of creation
            - url:       (string) location of image, OR
            - file       (object) contains metadata about this images file
        - pages: object
            - next: (string) the id of the next image in the gallery
            - prev: (string) the id of the previous image in the gallery
 
 
``` 
$ curl http://localhost:3000/api/images"?"first
```

### Read

- description: retrieve the comments for an image on a given page
- request: `GET /api/images/:id/comments[?page=1]`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - comments: (array of objects) the comments that belong to this page
      - numPages: (int) the total number of comment pages
      - page: (int) the current page of comments
 
``` 
$ curl -k -b cookie.txt https://localhost:3000/api/users/aaa/images/1Raze84UsB5VbmxW/comments/
``` 
  
### Delete
  
- description: delete the image with given id
- request: `DELETE /api/users/:username/images/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - next: (string) the next image to show
- response: 404
    - body: Image id does not exist

``` 
$ curl -X DELETE https://localhost:3000/api/users/aaa/images/jed5672jd90xg4awo789/
``` 

### Delete
  
- description: delete the comment id
- request: `DELETE /api/messages/:id/comments/:cid/`
- response: 200
    - content-type: `application/json`
    - body: object
        - id:    (string) the id of the deleted comment
        - count: (int)    the number of comments remaining for this image
- response: 404
    - body: comment :id does not exists

``` 
$ curl -X DELETE https://localhost:3000/api/users/aaa/images/jed5672jd90xg4awo789/comments/jed5672jd90xg4awo789/
```

### Delete
  
- description: sign out
- request: `DELETE /signout/
- response: 200
- response: 404
    - body: comment :id does not exists

``` 
$ curl -k -X DELETE https://localhost:3000/signout/
```

