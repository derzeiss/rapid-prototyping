'use strict';
(function () {
    angular
        .module('boxList', [])
        .component('boxList', {
            templateUrl: 'box-list/box-list.template.html',
            controller: boxListController
        });

    boxListController.$inject = [];

    function boxListController() {
        const ctrl = this;

        ctrl.floor = Math.floor;

        ctrl.elementsPerRow = 4;

        ctrl.boxes = [
            'I am one',
            'Hi, I am two',
            'What up, here comes three',
            4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
        ];

        ctrl.boxes = ctrl.boxes.map(function (box) {
            return {
                text: box,
                color: getRandomColor()
            }
        });

        //////////////////////////////

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    }
})();