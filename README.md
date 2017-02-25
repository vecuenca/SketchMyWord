# 3honeys
Three Honeys

## team members
* Brandon Ramoudith (ramoudit)
* Vincent Cuenca    (cuencavi)
* Jason Zheng       (zhengyo4)

## $drawApp
A game similar to Pictionary, where players try to guess the picture being drawn by a master artist. The faster they guess correctly, the more points they earn! The player with the most points at the end of the game is crowned the winner.

The basic flow of a game round:

1. One player is chosen as the Artist.
2. The Artist is given a word to draw. 
3. The rest of the players try to guess the word. They are given one minute to do so.4. When a player correctly guesses the word being drawn by the Artist, they earn points according to how much time is left.
5. The round continues until all players guess the word or time runs out. 


## expected beta features
1. A user goes on our site and creates a new game. They are given a session id which they can share with up to 3 other friends.
2. 4 players are able to play a basic version of $drawApp. 

## expected final features
1. The ability to create accounts.
2. A public RESTful API including the ability to fetch player statistics as well as word statistics.
3. Additional artists tools, including different colours, brush sizes, and brush shapes.
4. Integration with social media including Facebook and Twitter.

## planned technologies
* frontend: React & bootstrap or material-ui
* backend:  node with express et al. or Ruby on Rails

## technical challenges
* implementing peer-to-peer communications
* concurrency

