import {driver, process as gprocess, structure} from 'gremlin';
import * as async from 'async';
declare var process : {
    env: {
      NEPTUNE_ENDPOINT: string
    }
  }
let conn: driver.DriverRemoteConnection;
let g: gprocess.GraphTraversalSource;

async function query() {
    return g.V().hasLabel('posts').toList()
}

async function doQuery() {
    let result = await query(); 
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: result["value"],
      };

}
export async function listPosts() {
    const getConnectionDetails = () => {
        const database_url = 'wss://' + process.env.NEPTUNE_ENDPOINT + ':8182/gremlin';
        return { url: database_url, headers: {}};
    };
    const createRemoteConnection = () => {
        const { url, headers } = getConnectionDetails();
        return new driver.DriverRemoteConnection(
            url, 
            { 
                mimeType: 'application/vnd.gremlin-v2.0+json', 
                pingEnabled: false,
                headers: headers 
            });       
    };
    const createGraphTraversalSource = (conn: driver.DriverRemoteConnection) => {
        return gprocess.traversal().withRemote(conn);
    };
    if (conn == null){
        conn = createRemoteConnection();
        g = createGraphTraversalSource(conn);
    }
return async.retry(
    { 
        times: 5,
        interval: 1000,
        errorFilter: function (err) { 
            
            // Add filters here to determine whether error can be retried
            console.warn('Determining whether retriable error: ' + err.message);
            
            // Check for connection issues
            if (err.message.startsWith('WebSocket is not open')){
                console.warn('Reopening connection');
                conn.close();
                conn = createRemoteConnection();
                g = createGraphTraversalSource(conn);
                return true;
            }       
            // Check for ConcurrentModificationException
            if (err.message.includes('ConcurrentModificationException')){
                console.warn('Retrying query because of ConcurrentModificationException');
                return true;
            }
            // Check for ReadOnlyViolationException
            if (err.message.includes('ReadOnlyViolationException')){
                console.warn('Retrying query because of ReadOnlyViolationException');
                return true;
            }
            
            return false; 
        }
        
    }, 
   
    doQuery()
    )
    ;

   
    
}
// const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
// const Graph = gremlin.structure.Graph
// declare var process : {
//     env: {
//       NEPTUNE_ENDPOINT: string
//     }
//   }
// async function createPost( {
//     let dc = new DriverRemoteConnection
//     (`wss:// + ${process.env.NEPTUNE_ENDPOINT} +:8182/gremlin`,
//      {})
//     const graph = new Graph()
//     const g = graph.traversal().withRemote(dc)

//     await 
//     dc.close()
//     return post
// }
// export default createPost
// const gremlin = require('gremlin')
// const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
// const Graph = gremlin.structure.Graph
// declare var process : {
//         env: {
//           NEPTUNE_ENDPOINT: string
//         }
//       }
// const listPosts = async () => {
//     let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_ENDPOINT}/gremlin`, {})
//     const graph = new Graph()
//     const g = graph.traversal().withRemote(dc)
//     try {
//       let data = await 
//       let posts = Array()

//       for (const v of data) {
//         const _properties = await g.V(v.id).properties().toList()
//         let post = _properties.reduce((acc, next) => {
//           acc[next.label] = next.value
//           return acc
//         }, {})
//         post.id = v.id
//         posts.push(post)
//       }
                
//       dc.close()
//       return posts
//     } catch (err) {
//         console.log('ERROR', err)
//         return null
//     }
// }

// export default listPosts