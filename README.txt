Smurf Village is a 3D world where you can go to view data on your smurf accounts.

Open questions:

1. API limits:
    20 requests every 1 second
    100 requests every 2 minutes

* A single match counts as a request so getting a reasonable amount of data for a summoner
could quickly eat through this limit.

Options:
    A. request more
    B. aggressive caching
    C. asynch loading

2. GLB files
    - Each champion is in a GLB file 
    - this is best place to download: https://modelviewer.lol/model-viewer?id=154000
    - a full GLB file with all animtions can be 20MB+
    - however, even one with just the idle animation is 1MB. 
    - Could look into saving space by making it a still model but the movement makes it life-like
    

    Including every champions model in the bundle would make it 200 MB+ (infeasible)

    So we, can store all the GLB files on the server and send the bytes when requested

3. Menu for configuring accounts



API: https://developer.riotgames.com/docs/lol

TODOs:

    Set up a linter
    Debug performance issues with scene 
    Maybe try this React/Three JS wrapper https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
    Make the mushroom color dynamic based on rank
    Add an interior scene with data