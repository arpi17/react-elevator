import React, { useState, useEffect } from 'react';
import './App.css';

// Constants
const TRAVEL_TIME = 3000; // Elevator travel time between two floors in milliseconds
const WAIT_TIME = 1000 // How much time the elevator waits when it reaches a destination

// Types
const floors = [0, 1, 2, 3, 4, 5] as const;
type Floors = typeof floors[number];
type Direction = 'up' | 'down';
type ElevatorState = 'initial' | 'waiting' | Direction;
type QueueUpdater = (newFloor: Floors) => void;

// Components
function Elevator({ goTo }: { goTo: QueueUpdater }) {
  return (
    <div className="Elevator">
      {floors
        .slice(0)
        .reverse()
        .map((floor) => (
          <button onClick={() => goTo(floor)} key={floor}>
            {floor}
          </button>
        ))}
    </div>
  );
}

function Floor({
  level,
  callElevator,
}: {
  level: Floors;
  callElevator: QueueUpdater;
}) {
  return (
    <div className="Floor">
      {level !== 5 && <button onClick={() => callElevator(level)}>UP</button>}
      <span>Level {level}</span>
      {level !== 0 && <button onClick={() => callElevator(level)}>DOWN</button>}
    </div>
  );
}

function App() {
  const [queue, setQueue] = useState<Floors[]>([]);
  const [currentFloor, setCurrentFloor] = useState<Floors>(0);
  const [elevatorState, setElevatorDirection] = useState<ElevatorState>('initial');

  // The current destination is comptued the first item of the queue
  const destination = queue[0] ?? null;

  // Move the elevator
  useEffect(() => {
    // Await for the asynchronous task of the callback action
    const delay = async (callback: (...args: any[]) => void, ms: number): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      callback();
    }

    if (destination === currentFloor) {
      // Clear current destination from queue
      delay(() => setQueue(([_, ...restOfQueue]) => [...restOfQueue]), WAIT_TIME);
    } else if (destination !== null) {
      // Update floor with directional change
      const direction = Math.sign(destination - currentFloor);
      delay(() => setCurrentFloor((currentFloor + direction) as Floors), TRAVEL_TIME);
    }
  }, [currentFloor, destination]);

  // Update (and lock in) the direction
  useEffect(() => {
    if (destination === null) {
      setElevatorDirection('initial');
    } else if (destination > currentFloor) {
      setElevatorDirection('up');
    } else if (destination < currentFloor) {
      setElevatorDirection('down');
    } else {
      setElevatorDirection('waiting')
    }
  }, [currentFloor, destination]);

  const updateQueue: QueueUpdater = (newFloor) => {
    if (currentFloor === newFloor || queue.includes(newFloor)) {
      return;
    }

    // If the queue is empty
    if (destination === null) {
      setQueue([newFloor]);
      return;
    }

    let insertAt: number;

    if (currentFloor < destination) {
      insertAt = queue.findIndex((floor) => floor > newFloor);
    } else {
      insertAt = queue.findIndex((floor) => floor < newFloor);
    }

    setQueue([...queue.slice(0, insertAt), newFloor, ...queue.slice(insertAt)]);
  };

  return (
    <div className="App">
      <div className="Floors">
        {floors
          .slice(0)
          .reverse()
          .map((floor) => (
            <Floor level={floor} callElevator={updateQueue} key={floor} />
          ))}
      </div>
      <Elevator goTo={updateQueue} />
      <div className="Details">
        <pre>
          Current floor: {currentFloor} <br />
          Destination: {destination} <br />
          Direction: {elevatorState} <br />
          Queue: {queue.join(',')}
        </pre>
      </div>
    </div>
  );
}

export default App;
