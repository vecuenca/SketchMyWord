# SketchMyWord API Documentation

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
        - active: (bool) is this room joinable?
        - roundStartTime: (date) time this round started
        - chatHistory: array of objects:
            - username: (string) username of sender
            - message: (string) message of sender
            - color: (string) color of sender
        - isArtist: (bool) are you the current artist for this round
        - lineHistory: array of line objects
        - scores: array of user objects with score:
            - username: (string) username of sender
            - message: (string) message of sender
            - score: (num) score of sender
        - wordToDraw: (string) word to draw if artist, blanks otherwise
- response: 403
    - body: Forbidden
 
 
``` 
$ curl -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/game/AgogFeistySquirrel
```
  
### Delete
  
- description: remove yourself from the given room
- request: `DELETE /api/game/:roomId`
- response: 200
    - content-type: `application/json`
    - body: object
        - success: (bool) if you left the room correctly
        - host: (bool) if you are the host of the room you left
- response: 403
    - body: Forbidden

``` 
$ curl -X DELETE -k -b cookie.txt \
    https://3honeys.cms-weblab.utsc.utoronto.ca/api/game/AgogFeistySquirrel
``` 
