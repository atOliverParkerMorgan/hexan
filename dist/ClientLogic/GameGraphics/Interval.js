export var Interval;
(function (Interval) {
    // create another interval
    function make_star_production_interval(fun, interval_time) {
        if (Interval.update_stars_interval_id != null)
            window.clearInterval(Interval.update_stars_interval_id);
        Interval.update_stars_interval_id = window.setInterval(fun, interval_time);
    }
    Interval.make_star_production_interval = make_star_production_interval;
    function make_update_progress_bar_interval(fun, interval_time) {
        if (Interval.update_progress_bar_interval_id != null)
            window.clearInterval(Interval.update_progress_bar_interval_id);
        Interval.update_progress_bar_interval_id = window.setInterval(fun, interval_time);
    }
    Interval.make_update_progress_bar_interval = make_update_progress_bar_interval;
})(Interval || (Interval = {}));
