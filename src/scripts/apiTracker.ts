// This rxjs functionality is used for how many API calls we are making to Riot
// in the past minute. As Riot has a strict limit of 50 per minute, it is good to get an idea
// of whether we are close to exceeding this.

import { Subject, interval, merge } from 'rxjs';
import { scan, startWith, map, share } from 'rxjs/operators';


const apiCall$ = new Subject<void>();

// Create an observable for the timer to clear old values
const clearOldValues$ = interval(10000); // Clear every 60 seconds

// Define the retention period (in milliseconds)
const retentionPeriod = 60000; // 5 minutes

// Combine API calls and clear events
export const apiCallCount$ = merge(
  apiCall$.pipe(map(() => ({ type: 'add', timestamp: Date.now() }))),
  clearOldValues$.pipe(map(() => ({ type: 'clear', timestamp: Date.now() })))
).pipe(
  scan((acc: number[], event) => {
    if (event.type === 'add') {
      return [...acc, event.timestamp];
    } else {
      const cutoffTime = event.timestamp - retentionPeriod;
      return acc.filter(timestamp => timestamp > cutoffTime);
    }
  }, []),
  startWith([]),
  share()
);

export function trackApiCall() {
  apiCall$.next();
}
