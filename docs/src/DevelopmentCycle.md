# Development Cycle

As a rule, the following process is recommended for making changes:

- Start by determining whether it is an automatically testible change. The main criteria for this are the degree to which it relies on interaction with the map display itself, and the variability of the UI. To provide some examples:

  - State transformations - such as the "Merge Vertices" operation - are easily testible, since we can create a function that takes in a set of parameters, and outputs a result deterministically based entirely on those initial parameters.
  - Most utility functions (so long as they don't require specific browser functions, or those functions can be abstracted away) - such as the parsing of `.msh` files - are also testible, since they are also entirely deterministic functions.
  - Some UI elements - such as the File Explorer & Editable Item components - have a simple, clear interface, and simple state transformations, making them easy to test. However, this is more of a judgement call. For example, I could probably set up a test for the BlockPanel (the inspector for blocks), but decided against it because it is more of an aggregator of functionality, and most of the interaction with it will either involve things that have been tested (such as the Editable Item), or things that cannot be easily tested (such as the Map component). On the flip side, some UI elements felt trivial enough for me to not bother setting up a test (such as the SelectionModeDetails component) - because they basically function as a very simple display.

- If it's a testible change, you want to follow this process:

  - First, start by adding a test case (or adjusting existing test cases) to match the expected behaviour. Ideally you would do this "one requirement at a time", but sometimes you may need to batch things (for example, if there are a number of existing cases that need to be adjusted)
  - Then run the test, to see if it fails. If it doesn't fail, since we didn't implement the behaviour, it means that either the test isn't testing the correct behaviour or the behaviour already exists - investigate that situation, and if the test isn't checking the correct thing adjust it.
  - Once the test has failed, go in and implement an initial, simple version that passes the tests.
  - Refactor/adjust the simple version to match the requirements better, ensuring it keeps passing the test.
  - Repeat the process with the next requirement. This way you ensure that you keep the code as simple as possible while still meeting the requirements, since you focus on providing the simplest solution you can each time, and refactoring/cleaning up as you go along.

- If it's not a testible change, make sure to have the application open to your local development server (if you are using gitpod, it should have been started automatically, and you can open it by opening the "Remote Explorer" panel on the left hand side, hovering over port 3000, and clicking the "Open Browser" button (the globe))
  - You want to first get to the point where the expected changes would be apparent, essentially working through the workflow until it is impossible. This will help you clarify exactly what you are looking to change
  - Start by making the simplest change to unblock the next step of the workflow
  - Once that next step is working, refactor/adjust the code
  - walk through the the workflow again to get to the next point where it's impossible or broken, and repeat the process, until the full flow works
  - Go back to the top of this process for any alternative workflow/paths you can think of to get into the situation, to try and find edge cases or other ways it may break. Because these changes aren't autmatically tested, you need to manually work through things to try and find if anything broke during the process - this is why you want to make as much of the code base automatically tested, since it helps reduce accidentaly breakages.

For more information on this test-driven development approach, I'd recommend looking at the [Continious Delivery](https://www.youtube.com/c/ContinuousDelivery) youtube channel, specifically this playlist: https://www.youtube.com/playlist?list=PLwLLcwQlnXByqD3a13UPeT4SMhc3rdZ8q
