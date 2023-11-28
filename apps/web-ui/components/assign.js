$(function () {
    "use strict"

    recalculateGroups()
var showData = function () {
            $(".server-status .data").show()
            $(".server-status .error").hide()
}

bansTable.on("responsive-resize", function () {
        if (bansTable.responsive.hasHidden() && !Cookies.get("tswebsite_banrowtip_hide")) {
            responsiveTip.show()
        } else {
            responsiveTip.hide()
        }
    });
  
    $(".group-assigner .list-group-item:not(.assigner-header)").click(function (e) {
        var checkbox = $(this).find("input[type=checkbox]")
        $(checkbox).prop("checked", !checkbox.is(':checked'))
        recalculateGroups()
    })

    $(".group-assigner input[type=checkbox]").change(function (e) {
        recalculateGroups()
    })

    function recalculateGroups() {
        var invalidGroups = false
        var assignerCategories = $(".group-assigner .assigner-category")

        assignerCategories.each(function (key, val) {
            var assignerCategory = $(val)
            var maxGroups = assignerCategory.data("maxgroups")
            var usedGroups = assignerCategory.find(":checkbox:checked").length
            var badge = assignerCategory.find(".assigner-header .badge")
            var isValid = usedGroups <= maxGroups

            badge.text(usedGroups + " / " + maxGroups)

            if (isValid) {
                badge.removeClass("badge-invalid")
            } else {
                badge.addClass("badge-invalid")
                invalidGroups = true
            }

            if (key === assignerCategories.length - 1) {
                // last iteration! update the "save" button state
                $(".group-assigner .assigner-save").prop("disabled", invalidGroups)
                $(".group-assigner .invalid-groups-alert").css("display", invalidGroups ? "inline-block" : "none")
            }
        })
    }
})
