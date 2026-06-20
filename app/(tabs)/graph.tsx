import { View, Text, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Network, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useKnowledgeStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { useEffect, useState, useRef } from 'react';
import { knowledgeDb } from '../../lib/database';

type FilterType = 'All' | 'Ideas' | 'Tasks' | 'People' | 'References';
const FILTERS: FilterType[] = ['All', 'Ideas', 'Tasks', 'People', 'References'];

const TYPE_MAP: Record<string, string> = {
  idea: 'Ideas',
  task: 'Tasks',
  person: 'People',
  reference: 'References',
  note: 'All',
  insight: 'All',
  project: 'All',
};

export default function GraphScreen() {
  const router = useRouter();
  const { items } = useKnowledgeStore();
  const { isDark } = useTheme();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [connections, setConnections] = useState<any[]>([]);
  const graphRef = useRef(null);

  useEffect(() => {
    loadConnections();
  }, [items]);

  const loadConnections = async () => {
    const conns = await knowledgeDb.getConnections();
    setConnections(conns);
    if (conns.length === 0 && items.length > 1) {
      await knowledgeDb.buildTagConnections();
      const rebuilt = await knowledgeDb.getConnections();
      setConnections(rebuilt);
    }
  };

  const filteredItems = activeFilter === 'All'
    ? items
    : items.filter(item => TYPE_MAP[item.type] === activeFilter);

  const graphData = generateGraphData(filteredItems, connections);

  const handleNodePress = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const selectedItem = selectedNode
    ? items.find(item => item.id === selectedNode)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5' }}>
      <View className="flex-1 p-4">
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="flex-row items-center justify-between mb-4"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Knowledge Graph
          </Text>
          <View style={{ width: 24 }} />
        </MotiView>

        {/* Filter Pills */}
        <View className="flex-row mb-4">
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setActiveFilter(filter);
                setSelectedNode(null);
              }}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === filter ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <Text className={`text-sm ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Graph Visualization */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 200 }}
          className={`flex-1 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          style={{
            overflow: 'hidden',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }),
          }}
        >
          {/* Zoom Controls */}
          <View className="absolute top-4 right-4 z-10 flex-row">
            <TouchableOpacity
              onPress={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
              className="p-2 bg-white/80 rounded-full mr-2"
            >
              <ZoomIn size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
              className="p-2 bg-white/80 rounded-full"
            >
              <ZoomOut size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Graph Canvas */}
          <View className="flex-1 items-center justify-center">
            <View
              style={{
                transform: [{ scale: zoomLevel }],
                width: 300,
                height: 400,
              }}
            >
              {graphData.nodes.map((node, index) => {
                const angle = (index / Math.max(graphData.nodes.length, 1)) * 2 * Math.PI;
                const x = 150 + Math.cos(angle) * 100;
                const y = 200 + Math.sin(angle) * 100;

                return (
                  <TouchableOpacity
                    key={node.id}
                    onPress={() => handleNodePress(node.id)}
                    style={{
                      position: 'absolute',
                      left: x - 25,
                      top: y - 25,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: selectedNode === node.id
                        ? '#3b82f6'
                        : getNodeColor(node.type, isDark),
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selectedNode === node.id ? 3 : 0,
                      borderColor: '#fff',
                      transform: [{ scale: selectedNode === node.id ? 1.2 : 1 }],
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 18 }}>
                      {getNodeEmoji(node.type)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {graphData.edges.map((edge, index) => {
                const sourceNode = graphData.nodes.find(n => n.id === edge.source);
                const targetNode = graphData.nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const sourceAngle = (graphData.nodes.indexOf(sourceNode) / Math.max(graphData.nodes.length, 1)) * 2 * Math.PI;
                const targetAngle = (graphData.nodes.indexOf(targetNode) / Math.max(graphData.nodes.length, 1)) * 2 * Math.PI;

                const x1 = 150 + Math.cos(sourceAngle) * 100;
                const y1 = 200 + Math.sin(sourceAngle) * 100;
                const x2 = 150 + Math.cos(targetAngle) * 100;
                const y2 = 200 + Math.sin(targetAngle) * 100;

                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: Math.min(x1, x2),
                      top: Math.min(y1, y2),
                      width: Math.abs(x2 - x1) || 1,
                      height: 2,
                      backgroundColor: edge.strength > 0.7 ? '#3b82f6' : isDark ? '#4b5563' : '#d1d5db',
                      opacity: Math.max(edge.strength, 0.2),
                      transform: [
                        { rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` },
                      ],
                    }}
                  />
                );
              })}
            </View>
          </View>

          {/* Stats */}
          <View className="absolute bottom-4 left-4">
            <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {graphData.nodes.length} items • {graphData.edges.length} connections
            </Text>
          </View>
        </MotiView>

        {/* Selected Node Details */}
        {selectedItem && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className={`mt-4 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              ...(Platform.OS === 'android' && { elevation: 2 }),
              ...(Platform.OS === 'ios' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }),
            }}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getNodeColor(selectedItem.type, isDark) }}
              >
                <Text className="text-white text-sm">
                  {getNodeEmoji(selectedItem.type)}
                </Text>
              </View>
              <Text className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedItem.title}
              </Text>
            </View>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {selectedItem.content.substring(0, 100)}...
            </Text>
            <View className="flex-row flex-wrap">
              {selectedItem.tags.map((tag, index) => (
                <Text
                  key={index}
                  className={`text-xs mr-2 mb-1 px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                >
                  #{tag}
                </Text>
              ))}
            </View>
          </MotiView>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <Network size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
            <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No knowledge items yet
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Capture some notes to see connections
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function generateGraphData(items: any[], connections: any[]) {
  const nodes = items.map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
  }));

  const nodeIds = new Set(nodes.map(n => n.id));
  const edges = connections
    .filter(conn => nodeIds.has(conn.sourceId) && nodeIds.has(conn.targetId))
    .map(conn => ({
      source: conn.sourceId,
      target: conn.targetId,
      strength: conn.strength,
    }));

  return { nodes, edges };
}

function getNodeColor(type: string, isDark: boolean) {
  const colors: Record<string, string> = {
    idea: isDark ? '#3730a3' : '#c7d2fe',
    task: isDark ? '#065f46' : '#a7f3d2',
    insight: isDark ? '#1e40af' : '#bfdbfe',
    project: isDark ? '#92400e' : '#fde68a',
    person: isDark ? '#713f12' : '#fef3c7',
    reference: isDark ? '#4b5563' : '#e5e7eb',
    note: isDark ? '#1e40af' : '#bfdbfe',
  };
  return colors[type] || colors.note;
}

function getNodeEmoji(type: string) {
  const emojis: Record<string, string> = {
    idea: '💡',
    task: '✅',
    insight: '💡',
    project: '📁',
    person: '👤',
    reference: '📚',
    note: '📝',
  };
  return emojis[type] || '📝';
}
