import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '6a0538190b2d432d9eac4abff5e80f93'
                    }
                    'incident-manager-page': {
                        table: 'sys_ui_page'
                        id: '2c22413a119846148acf26f22a02b09c'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '4bec77914e684a01a4733ced6fe2e429'
                    }
                    'x_174120_edupulse/main': {
                        table: 'sys_ux_lib_asset'
                        id: 'b816e521920c44e5b276e1b4fff32d28'
                    }
                    'x_174120_edupulse/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '7ebfc87388304ce380fdbaf13ffa5c87'
                    }
                }
            }
        }
    }
}
