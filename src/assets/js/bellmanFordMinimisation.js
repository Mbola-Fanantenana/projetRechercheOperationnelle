import { convertDataForAlgo } from "./visJsDataConvertor.js";

function bellmanFordMin(graph, source) {
  const distances = {};
  const predecessors = {};

  // Étape 1: Initialisation
  for (let node in graph) {
    distances[node] = Infinity;
    predecessors[node] = null;
  }
  distances[source] = 0;

  // Étape 2: Relaxation des arêtes
  for (let i = 0; i < Object.keys(graph).length - 1; i++) {
    for (let node in graph) {
      for (let edge of graph[node]) {
        const [neighbor, weight] = edge;
        if (distances[node] + weight < distances[neighbor]) {
          distances[neighbor] = distances[node] + weight;
          predecessors[neighbor] = node;
        }
      }
    }
  }

  // Étape 3: Vérification des cycles de poids négatif
  for (let node in graph) {
    for (let edge of graph[node]) {
      const [neighbor, weight] = edge;
      if (distances[node] + weight < distances[neighbor]) {
        return {
          error: "Le graphe contient un cycle de poids négatif.",
          negativeCycle: true,
        };
      }
    }
  }

  return { distances, predecessors };
}

//shortest Path
function shortestPathMin(graph, source, destination) {
  const { distances, predecessors } = bellmanFordMin(graph, source);

  if (distances[destination] === Infinity) {
    return "Il n'y a pas de chemin entre le nœud source et la destination.";
  }

  const path = [];
  let current = destination;

  while (current !== null) {
    path.unshift(current);
    current = predecessors[current];
  }

  const pathWeight = distances[destination];

  return { path, weight: pathWeight };
}

export function bellmanFordMinimisation(dataInput, source, dest) {
  const graph = convertDataForAlgo(dataInput);

  const sourceNode = source;

  // const { distances, predecessors } = bellmanFordMin(graph, sourceNode);

  // console.log("Distances minimales à partir du nœud source:", distances);
  // console.log("Prédécesseurs:", predecessors);

  console.log("----------------------------------------------------------");

  const result = shortestPathMin(graph, sourceNode, dest);

  // console.log("Chemin le plus court:", result.path);
  // console.log("Poids total du chemin:", result.weight);

  return result;
}
