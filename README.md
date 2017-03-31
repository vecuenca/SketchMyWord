# SketchMyWord by the Three Honeys
You can access our app at:
https://3honeys.cms-weblab.utsc.utoronto.ca/

our video demo can be found here https://www.youtube.com/watch?v=kxthCLOEQjg&feature=youtu.be

our api docs can be found [here](api.md)


## Compatibility
Please use Chrome.

## team members
* Brandon Ramoudith (ramoudit)
* Vincent Cuenca    (cuencavi)
* Jason Zheng       (zhengyo4)

## SketchMyWord
A game similar to Pictionary, where players try to guess the picture being drawn by a master artist. The faster they guess correctly, the more points they earn! The player with the most points at the end of the game is crowned the winner.

The basic flow of a game round:

1. One player is chosen as the Artist.
2. The Artist is given a word to draw. 
3. The rest of the players try to guess the word. They are given one minute to do so. As the clock winds down, random letters of the word are revealed to the player.
4. The first player to guess the word gets the most points. Players that guess the word after earn a reduced amount of points.
5. The round continues until all players guess the word or time runs out.
6. A new Artist is chosen and another round begins.  


## expected beta features
* A user goes on our site and creates a new game. They are given a session id which they can share with up to 3 other friends.
* Since we do not know the technical complexity of streaming a drawing to other players, we will have two expected versions of our beta:
  * The first one is a drawable canvas that is streamed to all other watchers.
  * If that is able to be completed fast enough, then we will deliver a basic version of SketchMyWord (as described above)

## expected final features
1. The ability to create accounts.
2. A public RESTful API including the ability to fetch player statistics as well as word statistics.
3. A front end high scores chart that displays player statistics.
4. Additional artists tools, including different colours, brush sizes, and brush shapes.
5. Integration with social media including Facebook and Twitter (i.e. the ability to invite friends and broadcast an open game is available to join)

## planned technologies
* frontend: React & bootstrap or material-ui
* backend:  node with express et al. or Ruby on Rails

## technical challenges
* implementing a sessional server-to-multiple-clients model
* concurrency and latency

