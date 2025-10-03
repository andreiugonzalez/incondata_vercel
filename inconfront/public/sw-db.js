
const db = new PouchDB('mensajes');

let token = '';

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_TOKEN') {
        console.log('Setendo token: ', event.data.token);
        token = event.data.token;
    }
})

function saveRequest ( message ) {

    console.log('Guardando mensaje: ', message);

    const _id = new Date().toISOString();

    db.put( {_id, ...message} ).then( () => {
        console.log('Mensaje guardado correctamente');

        self.registration.sync.register('inicio-sesion');

        const newResp = { ok: true, offline: true };

        return new Response( JSON.stringify(newResp) );
        
    })

}

function postMessages() {

    const posteos = [];

    return db.allDocs({ include_docs: true }).then( docs => {


        docs.rows.forEach( row => {

            const doc = row.doc;

            console.log('Doc a mandar: ', doc[0]);
            console.log('token a mandar: ', token);

            const fetchPom =  fetch('http://localhost:3111/organizacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(doc[0])
                }).then( res => {
                    console.log('respuesta desde cache: ', res);
                    return db.remove( doc );

                });
            
            posteos.push( fetchPom );


        }); // fin del foreach

        return Promise.all( posteos );

    });
}