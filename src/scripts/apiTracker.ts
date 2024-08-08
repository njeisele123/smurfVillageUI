// This rxjs functionality is used for how many API calls we are making to Riot
// in the past minute. As Riot has a strict limit of 50 per minute, it is good to get an idea
// of whether we are close to exceeding this.

// TODO: bug, the cleanup interval appears to be adding a call
import { Subject, timer, combineLatest } from 'rxjs';
import { scan, startWith, map, share } from 'rxjs/operators';

interface ApiCall {
  timestamp: number;
}

const apiCallSubject = new Subject<ApiCall>();
const cleanupSubject = new Subject<void>();
const cleanupInterval = 60000; // 60 seconds
const retentionPeriod = 60000; // 60 seconds

const removeOldCalls = (calls: ApiCall[]): ApiCall[] => {
  const cutoffTime = Date.now() - retentionPeriod;
  return calls.filter(call => call.timestamp > cutoffTime);
};

// combine latest looks at both subjects
const apiCalls$ = combineLatest([
  apiCallSubject.pipe(startWith(null)),
  cleanupSubject.pipe(startWith(null))
]).pipe(
  scan((acc: ApiCall[], [call]) => {
    if (call) {
      return removeOldCalls([...acc, call]);
    } else {
      return removeOldCalls(acc);
    }
  }, []),
  share() // share pipeline with all observers
);

export const apiCallCount$ = apiCalls$.pipe(
  map(calls => calls.length),
  share()
);

export const trackApiCall = () => {
  apiCallSubject.next({ timestamp: Date.now() });
};

// Set up periodic cleanup
timer(0, cleanupInterval).subscribe(() => {
  cleanupSubject.next();
});