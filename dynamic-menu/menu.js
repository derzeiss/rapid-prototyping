(function ($) {

    // private properties
    const TEMPLATE = {
        TEMPLATE_START: '{{',
        TEMPLATE_END: '}}',
        MENU_WRAPPER: '<nav class="' + cls('expanded') + '">{{menu}}</nav>',
        MENU: '<ul>{{items}}</ul>',
        ITEM: '<li data-key="{{key}}"> \
                 <span class="' + cls('select-item') + '">{{value}}</span>\
                 {{children}}\
               </li>',
        ITEM_EXPANDER: '<button class="' + cls('toggle-item') + '">toggle</button>'
    };

    // ---------- private helper functions ----------

    function generateMenu(items) {
        if (!items) return console.log('no items');

        let html = '';
        items.forEach(function (item) {
            html += TEMPLATE.ITEM
                .replace(toTplId('key'), item.key)
                .replace(toTplId('value'), item.value)
                .replace(toTplId('children'), item.children ? TEMPLATE.ITEM_EXPANDER + generateMenu(item.children) : '')
        });
        return TEMPLATE.MENU.replace(toTplId('items'), html);
    }

    function toTplId(val) {
        return TEMPLATE.TEMPLATE_START + val + TEMPLATE.TEMPLATE_END;
    }

    function cls(val) {
        return 'dynamic-menu--' + val;
    }

    $.DynamicMenu = (function () {
        function DynamicMenu(model) {
            const self = this;
            self.model = model;
            self.parentNode = null;
            self.node = null;
            self.root = null;
            self.selected = {};
        }

        /**
         * Insert menu into <node>. All other child nodes of <node> are removed.
         * @param node - jQuery node to insert menu into
         */
        DynamicMenu.prototype.appendTo = function (node) {
            const self = this;
            self.parentNode = node;

            self.parentNode
                .on('click', '.' + cls('toggle-item'), function (ev) {

                    const targetNode = $(ev.target).parent(),
                        state = targetNode.hasClass(cls('expanded')) ? 'collapsed' : 'expanded',
                        key = targetNode.attr('data-key');

                    // toggle dom class
                    targetNode.toggleClass(cls('expanded'));
                    // collapse all child elements (emulate toggle button click to fire event)
                    if (state === 'collapsed') {
                        targetNode.find('.' + cls('expanded') + '> .' + cls('toggle-item')).click();
                    }

                    // fire callbacks
                    self.onItemToggle(key, state);
                    if (state === 'expanded') self.onItemExpanded(key);
                    else self.onItemCollapsed(key);
                })
                .on('click', '.' + cls('select-item'), function (ev) {
                    const targetNode = $(ev.target).parent();

                    $('.' + cls('selected')).removeClass(cls('selected'));
                    targetNode.addClass(cls('selected'));
                    self.selected.key = targetNode.attr('data-key');
                    self.selected.value = $(ev.target).text();

                    self.onItemSelected(self.selected);
                });

            self.node = $(TEMPLATE.MENU_WRAPPER.replace(toTplId('menu'), generateMenu(self.model)));
            self.root = self.node.children().filter('ul');
            self.parentNode.html(self.node);
        };


        // ---------- DESIGN STUDIO SPECIFIC GETTERS ----------
        /*
         NOTE:
         - design studios 'value' is equivalent to 'key' in this plugin
         - design studios 'text' is equivalent to 'value' in this plugin

         */

        DynamicMenu.prototype.getSelectedValue = function () {
            const self = this;
            return self.selected.key;
        };

        DynamicMenu.prototype.getSelectedText = function () {
            const self = this;
            return self.selected.value;
        };

        // ---------- MODEL MODIFICATION ----------

        DynamicMenu.prototype.addItem = function (parentKey, key, value) {
            const self = this;
            let parentNode,
                item,
                childrenList;

            // set parent node to root node if omitted
            if (parentKey) parentNode = $('li[data-key="' + parentKey + '"]');
            else parentNode = self.node;

            // generate item html
            item = TEMPLATE.ITEM
                .replace(toTplId('key'), key)
                .replace(toTplId('value'), value)
                .replace(toTplId('children'), '');

            // append item to existing children list
            childrenList = parentNode.children().filter('ul');
            if (childrenList.length) childrenList.append(item);
            // ...or create one first if not existent
            else parentNode.append(TEMPLATE.MENU.replace(toTplId('items'), item));
        };

        DynamicMenu.prototype.removeItem = function (key) {
            $('li[data-key="' + key + '"]').remove();
        };

        // ---------- CALLBACKS ----------

        /**
         * Called when a menuItem is expanded or collapsed
         * @param key - toggled menu node as jQuery node
         * @param state - 'expanded' if an item is expanded, otherwise 'collapsed'
         */
        DynamicMenu.prototype.onItemToggle = function (key, state) {
            console.log('onMenuItemToggle', key, state);
        };

        DynamicMenu.prototype.onItemExpanded = function (key) {
            console.log('onItemExpanded', key);

        };

        DynamicMenu.prototype.onItemCollapsed = function (key) {
            console.log('onItemCollapsed', key);
        };

        /**
         * Called when a navigation item is clicked.
         * @param key - key of navItem clicked
         */
        DynamicMenu.prototype.onItemSelected = function (key) {
            console.log('onNavigate', key)
        };

        return DynamicMenu;
    })();

})(jQuery);