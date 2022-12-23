export var Interval;
(function (Interval) {
    // create another interval
    function makeStarProductionInterval(fun, interval_time) {
        if (Interval.update_stars_interval_id != null)
            window.clearInterval(Interval.update_stars_interval_id);
        Interval.update_stars_interval_id = window.setInterval(fun, interval_time);
    }
    Interval.makeStarProductionInterval = makeStarProductionInterval;
    function makeUpdateProgressBarInterval(fun, interval_time) {
        if (Interval.update_progress_bar_interval_id != null)
            window.clearInterval(Interval.update_progress_bar_interval_id);
        Interval.update_progress_bar_interval_id = window.setInterval(fun, interval_time);
    }
    Interval.makeUpdateProgressBarInterval = makeUpdateProgressBarInterval;
})(Interval || (Interval = {}));
