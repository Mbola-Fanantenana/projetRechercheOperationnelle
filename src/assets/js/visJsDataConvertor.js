export function convertDataForAlgo(dataInput) {
  const graph = {};


  JSON.parse(dataInput).forEach((item) => {
    const key = Object.keys(item)[0];
    const value = parseInt(item[key]);

    const [source, target] = key.split(",");

    if (!graph[source]) {
      graph[source] = [];
    }

    graph[source].push([target, value]);
  });

  console.log(graph);
  return graph;
}