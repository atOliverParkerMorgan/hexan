export namespace Interval{
    // to keep a reference to the intervals
    export let update_progress_bar_interval_id: number;
    export let update_stars_interval_id: number;

    // create another interval
    export function makeStarProductionInterval(fun: any, interval_time: number) {
        if(Interval.update_stars_interval_id != null)  window.clearInterval(Interval.update_stars_interval_id);
        Interval.update_stars_interval_id = window.setInterval(fun, interval_time);
    }
    export function makeUpdateProgressBarInterval(fun: any, interval_time: number) {
        if(Interval.update_progress_bar_interval_id != null)  window.clearInterval(Interval.update_progress_bar_interval_id);
        Interval.update_progress_bar_interval_id = window.setInterval(fun, interval_time);
    }
}