<script>
import { DataSet, Network } from 'vis-network/standalone';

export default {
  data() {
    return {
      newNodeLabel: '',
      nodes: new DataSet(),
      edges: new DataSet(),
      edgeValueInput: '',
      selectedNode: null,
      startNode: null,
      endNode: null,
      arcValues: '',
      startNodeGraph: '',
      endNodeGraph: '',
      nouveauLabel: ''
    };
  },
  mounted() {
    this.renderGraph();
  },
  methods: {
    renderGraph() {
      const data = {
        nodes: this.nodes,
        edges: this.edges
      };
      const options = {
        interaction: {
          selectConnectedEdges: false
        },
        edges: {
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.5,
              type: "arrow"
            }
          },
          color: {
            inherit: false
          }
        }
      };

      const container = this.$refs.graphContainer;

      // Mettre à jour la couleur des nœuds de début et de fin
      if (this.startNode) {
        this.nodes.update([
          {
            id: this.startNode,
            color: {
              background: '#00C853',
              border: '#00C853'
            }
          }]);
      }
      if (this.endNode) {
        this.nodes.update([
          {
            id: this.endNode,
            color:
            {
              background: '#FF3D00',
              border: '#FF3D00'
            }
          }]);
      }

      const network = new Network(container, data, options);

      network.on("click", (event) => {
        const { nodes, edges } = event;
        if (edges.length === 1) {
          const edgeId = edges[0];
          const edge = this.edges.get(edgeId);

          // Éditer la valeur de l'arc
          const newEdgeValue = prompt("Entrez la valeur de l'arc :");
          if (newEdgeValue !== null) {
            edge.label = newEdgeValue.trim();
            this.edges.update(edge);
          }
        } else if (nodes.length > 0) {
          const clickedNodeId = nodes[0];

          if (this.selectedNode && this.selectedNode !== clickedNodeId) {
            const newEdge = {
              from: this.selectedNode,
              to: clickedNodeId,
              label: this.edgeValueInput.trim()
            };

            this.edges.add(newEdge);
            this.selectedNode = null;
            this.edgeValueInput = '';
            this.renderGraph();
          } else {
            this.selectedNode = clickedNodeId;
          }
        }
      });
    },

    ajouterNoeud() {
      if (this.newNodeLabel.trim() === '') {
        return;
      }

      let id = this.generateUniqueId();
      while (this.nodes.get(id)) {
        id = this.generateUniqueId();
      }

      const newNode = {
        id: id,
        label: this.newNodeLabel.trim(),
        color: {
          background: '#A5B4FC',
          border: '#2B6CB0'
        }
      };

      this.nodes.add(newNode);

      // Mettre à jour les nœuds de début et de fin
      if (this.startNode === null) {
        this.startNode = id;
      } else {
        if (this.endNode !== null) {
          const prevEndNode = this.nodes.get(this.endNode);
          prevEndNode.color = {};
          this.nodes.update(prevEndNode);
        }

        this.endNode = id;
        const newEndNode = this.nodes.get(this.endNode);
        newEndNode.color = {
          background: '#FF3D00',
          border: '#FF3D00'
        };
        this.nodes.update(newEndNode);
      }

      const startNodeGraph = this.nodes.get(this.startNode).label;
      const endNodeGraph = this.nodes.get(this.endNode).label;

      this.startNodeGraph = startNodeGraph;
      this.endNodeGraph = endNodeGraph;

      this.newNodeLabel = '';

      this.renderGraph();
    },

    generateUniqueId() {
      let id = this.nodes.length + 1;
      while (this.nodes.get(id)) {
        id++;
      }
      return id;
    },

    supprimerNoeud() {
      if (this.selectedNode === this.startNode) {
        this.startNode = null;
      } else if (this.selectedNode === this.endNode) {
        this.endNode = null;
      }

      this.nodes.remove(this.selectedNode);
      this.edges.remove(this.edges.get({ filter: (edge) => edge.from === this.selectedNode || edge.to === this.selectedNode }));
      this.selectedNode = null;

      // Mettre à jour le nœud de fin si le nœud supprimé était le nœud de fin
      if (!this.endNode && this.nodes.length > 0) {
        const lastNodeId = this.nodes.getIds()[this.nodes.length - 1];
        this.endNode = lastNodeId;
        console.log('Noeud de fin mis à jour:', this.endNode);
      }
    },
    /*
    modifierNoeud() {
      if (this.selectedNode && this.nouveauLabel.trim() !== '') {
        const existingNode = this.nodes.get(this.selectedNode);

        if (existingNode) {
          existingNode.label = this.nouveauLabel.trim();
          this.nodes.update(existingNode);
          this.renderGraph();
        }

        this.nouveauLabel = '';
      }
    },*/


    addEdge() {
      if (this.selectedEdge) {
        this.selectedEdge.label = this.edgeValueInput.trim();
        this.edges.update(this.selectedEdge);
        this.selectedEdge = null;
        this.edgeValueInput = '';
        this.renderGraph();
      }
    }
  },
  watch: {
    edges: {
      handler(newEdges) {
        const arcValues = newEdges.map((edge) => {
          const { from, to, label } = edge;
          const formLabel = this.nodes.get(from).label;
          const toLabel = this.nodes.get(to).label;
          return { [`${formLabel},${toLabel}`]: label };
        });

        if (this.endNode !== null) {
          const lastNodeLabel = this.nodes.get(this.endNode).label;
          const lastArcValue = { [lastNodeLabel]: '0' };
          arcValues.push(lastArcValue);
        }

        this.arcValues = (JSON.stringify(arcValues));
      },
      deep: true
    }
  }

};
</script>

<template>
  <div class="container mx-auto my-5">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-1">
        <div class="flex items-center">
          <div class="mr-4">
            <input v-model="newNodeLabel" type="text" placeholder="Entrer le noeud ici"
              class="p-2 border border-gray-200 rounded w-40" />
          </div>
          <div class="mr-4">
            <button @click="ajouterNoeud" class="px-4 py-2 bg-blue-500 text-white rounded">Ajouter</button>
          </div>
          <div class="mr-4">
            <button @click="supprimerNoeud" :disabled="!selectedNode"
              class="px-4 py-2 bg-red-500 text-white rounded">Supprimer</button>
          </div>
          <div class="mr-4">
            <button @click="runAlgo" class="px-4 py-2 bg-blue-500 text-white rounded">Résultat</button>
          </div>
        </div>
      </div>
      <div class="col-span-2">
        <div class="w-full h-80 bg-gray-300 rounded" ref="graphContainer"></div>
      </div>
      <div class="col-span-1">
        <div class="bg-white shadow-lg rounded-lg p-4">
          <h2 class="text-xl font-bold mb-2">Valeurs des arcs entre les noeuds :</h2>
          <ul>
            <!-- <li v-for="(value, index) in arcValues" :key="index">{{ value }}</li> -->
            {{ arcValues }}
          </ul>
        </div>
      </div>
      <div class="col-span-1">
        <div class="bg-white shadow-md rounded-lg p-4">
          <h2 class="text-xl font-bold mb-2">Entrée et sortie</h2>
          <div class="flex justify-between">
            <span>Noeud de début: {{ startNodeGraph }}</span>
          </div>
          <div class="flex justify-between">
            <span>Noeud de fin: {{ endNodeGraph }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-2">
      <div class="bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 class="text-xl font-bold mb-2">Modifier un nœud</h2>
        <div class="flex items-center">
          <div class="mr-4">
            <input v-model="nouveauLabel" type="text" placeholder="Nouveau label"
              class="p-2 border border-gray-200 rounded w-40" />
          </div>
          <div class="mr-4">
            <button @click="modifierNoeud" :disabled="!nouveauLabel"
              class="px-4 py-2 bg-blue-500 text-white rounded">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>