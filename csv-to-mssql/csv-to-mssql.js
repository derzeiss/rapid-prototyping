(() => {

    const CSV = {
        FIRSTNAME: 0,
        LASTNAME: 1,
        EMAIL: 2,
        PHONE: 3
    };

    let Nodes;


    function getNodes() {
        return {
            input: document.getElementById('input'),
            output: document.getElementById('output'),
            btnConvert: document.getElementById('btn-convert')
        }
    }

    function init() {
        Nodes = getNodes();

        Nodes.btnConvert.addEventListener('click', convert);
    }

    window.onload = init;

    ////////////////////////

    function convert() {
        let input = Nodes.input.value;
        let rows = input.split('\n');
        rows.shift();

        Nodes.output.value = rows.map((row) => {
            let rowAsArray = row.split(',').map((i) => i.replace(/"/g, '')),
                firstname = rowAsArray[CSV.FIRSTNAME],
                lastname = rowAsArray[CSV.LASTNAME],
                displayName = firstname + ' ' + lastname,
                email = rowAsArray[CSV.EMAIL],
                phone = rowAsArray[CSV.PHONE];

            return `INSERT INTO TERMINALUSER (USERTERMINALDISPLAYNAME, FIRSTNAME, LASTNAME, EMAILADDRESS, MOBILEPHONENUMBER, SECURITYLEVEL) 
            VALUES ('${displayName}', '${firstname}', '${lastname}', '${email}', '${phone}', '6');`.replace(/\s+/g, ' ');
        }).join('\n');
    }

})();