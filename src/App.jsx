import { useState } from "react";
import { useEffect } from "react";
import "./App.css";

function generateSequence(nBack) {
  const TOTAL_TRIALS = 14;
  const TOTAL_MATCHES = 5;
  const length = nBack + TOTAL_TRIALS;

  const isMatch = new Array(length).fill(false);
  const sequence = new Array(length);

  // Decide which indices are true matches
  let matchesPlaced = 0;

  for (let i = nBack + 1; i < length; i++) {
    const remainingSlots = length - i;
    const remainingMatches = TOTAL_MATCHES - matchesPlaced;

    if (
      remainingMatches > 0 &&
      (Math.random() < 0.5 || remainingSlots === remainingMatches)
    ) {
      isMatch[i] = true;
      matchesPlaced++;
    }
  }

  // Helper to get a random digit not equal to exclusions
  function randomDigit(exclude = []) {
    let num;
    do {
      num = Math.floor(Math.random() * 10);
    } while (exclude.includes(num));
    return num;
  }

  // Build sequence
  for (let i = 0; i < length; i++) {
    if (i < nBack) {
      sequence[i] = randomDigit(
        i > 0 ? [sequence[i - 1]] : []
      );
    } else if (isMatch[i]) {
      const forced = sequence[i - nBack];

      // Prevent consecutive repeat even on forced match
      if (forced === sequence[i - 1]) {
        sequence[i] = randomDigit([forced]);
      } else {
        sequence[i] = forced;
      }
    } else {
      sequence[i] = randomDigit([
        sequence[i - 1],
        sequence[i - nBack],
      ]);
    }
  }

  return sequence;
}

function App() {
  const [screen, setScreen] = useState("welcome");
  const [nBack, setNBack] = useState(null);
  const [clickedIndices, setClickedIndices] = useState(new Set());

  // Game state
  const totalTrials = 10;
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);

  function startGame(n) {
    const newSequence = generateSequence(n);
    setNBack(n);
    setSequence(newSequence);
    setCurrentIndex(0);
    setCorrectClicks(0);
    setClickedIndices(new Set());
    setFalseAlarms(0);
    setScreen("game");
  }

  function isCurrentMatch() {
    if (currentIndex < nBack) return false;
    return sequence[currentIndex] === sequence[currentIndex - nBack];
  }

  function handleMatchClick() {
    if (clickedIndices.has(currentIndex)) return;

    setClickedIndices((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    if (isCurrentMatch()) {
      setCorrectClicks((prev) => prev + 1);
    } else {
      setFalseAlarms((prev) => prev + 1);
    }
  }

  useEffect(() => {
    if (screen !== "game") return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= sequence.length) {
          clearInterval(intervalId);
          setScreen("results");
          return prevIndex;
        }

        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [screen, sequence]);

  const missedMatches = 5 - correctClicks;

  const accuracy = Math.round(
    (correctClicks / 5) * 100
  );


  return (
    <div className="app">
      {screen === "welcome" && (
        <div className="screen">
          <h1>N-Back Trainer</h1>
          <p>
            You will see a sequence of single digits appear one at a time.
            Each number stays on the screen for 1 second.
          </p>

          <p>
            Click <strong>Match</strong> only if the current number is the same
            as the number from <strong>N steps earlier</strong>. 
            For instance, if you are playing 5-Back, click on a number if it is the same as the number from 5 steps earlier. 
            If it is not a match, do nothing.
          </p>

          <p className="small-text">
            There are exactly 5 matches in each round.
          </p>

          <button
            onClick={() => {
              startGame(2);
            }}
          >
            Start 2-Back
          </button>

          <button
            onClick={() => {
              startGame(5);
            }}
          >
            Start 5-Back
          </button>

          <button
            onClick={() => {
              startGame(8);
            }}
          >
            Start 8-Back
          </button>
        </div>
      )}

      {screen === "game" && (
        <div className="screen">
          <h2>Game Screen</h2>
          <p>Mode: {nBack}-back</p>

          <div className="stimulus">
            {sequence[currentIndex]}
          </div>
          <button onClick={handleMatchClick}>
            Match
          </button>
          <p>
            {currentIndex + 1} / {sequence.length}
          </p>
        </div>
      )}

      {screen === "results" && (
        <div className="screen">
          <h2>Results</h2>

          <p>
            Correct matches: <strong>{correctClicks} / 5</strong>
          </p>
          <p>
            Missed matches: <strong>{missedMatches}</strong>
          </p>
          <p>
            False alarms: <strong>{falseAlarms}</strong>
          </p>

          <p>
            Accuracy: <strong>{accuracy}%</strong>
          </p>

          <button onClick={() => setScreen("welcome")}>
            Back to Start
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
