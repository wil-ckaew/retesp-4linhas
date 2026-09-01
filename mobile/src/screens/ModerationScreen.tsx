import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ModerationLog {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  status: 'approved' | 'blocked' | 'pending';
  reason?: string;
  moderated_at: string;
}

export default function ModerationScreen() {
  const [logs, setLogs] = useState<ModerationLog[]>([
    {
      id: '1',
      text: 'Excelente treino hoje!',
      user: 'João',
      timestamp: new Date().toLocaleString(),
      status: 'approved',
      moderated_at: new Date().toLocaleString(),
    },
    {
      id: '2',
      text: 'Mensagem ofensiva detectada',
      user: 'Desconhecido',
      timestamp: new Date().toLocaleString(),
      status: 'blocked',
      reason: 'Linguagem ofensiva',
      moderated_at: new Date().toLocaleString(),
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'blocked' | 'pending'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = {
    total: logs.length,
    approved: logs.filter(l => l.status === 'approved').length,
    blocked: logs.filter(l => l.status === 'blocked').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  const getFilteredLogs = () => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return '#22c55e';
      case 'blocked': return '#ef4444';
      case 'pending': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'approved': return 'rgba(34, 197, 94, 0.1)';
      case 'blocked': return 'rgba(239, 68, 68, 0.1)';
      case 'pending': return 'rgba(234, 179, 8, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return 'check-circle';
      case 'blocked': return 'alert-circle';
      case 'pending': return 'clock';
      default: return 'shield';
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Limpar Logs',
      'Tem certeza que deseja limpar todos os logs?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: () => setLogs([]) },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderLog = ({ item }: { item: ModerationLog }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => toggleExpand(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.logHeader}>
        <View style={styles.logUser}>
          <Icon name="user" size={16} color="#6b7280" />
          <Text style={styles.logUserName} numberOfLines={1}>{item.user}</Text>
        </View>
        <View style={[styles.logStatus, { backgroundColor: getStatusBg(item.status) }]}>
          <Icon name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
          <Text style={[styles.logStatusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.logText} numberOfLines={expandedId === item.id ? undefined : 1}>
        {item.status === 'blocked' ? '🚫 Mensagem bloqueada' : item.text}
      </Text>

      <View style={styles.logFooter}>
        <Icon name="calendar" size={12} color="#6b7280" />
        <Text style={styles.logTime}>{item.timestamp}</Text>
        {expandedId === item.id ? (
          <Icon name="chevron-up" size={16} color="#6b7280" style={styles.expandIcon} />
        ) : (
          <Icon name="chevron-down" size={16} color="#6b7280" style={styles.expandIcon} />
        )}
      </View>

      {expandedId === item.id && item.reason && (
        <View style={styles.expandedContent}>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Motivo:</Text>
            <Text style={styles.expandedReason}>{item.reason}</Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Moderado em:</Text>
            <Text style={styles.expandedValue}>{item.moderated_at}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (key: string, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === key && styles.filterButtonActive]}
      onPress={() => setFilter(key as any)}
    >
      <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield" size={24} color="#a78bfa" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Moderação</Text>
          <Text style={styles.headerSubtitle}>IA Moderadora</Text>
        </View>
        <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
          <Icon name="trash-2" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Aprovadas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.blocked}</Text>
          <Text style={styles.statLabel}>Bloqueadas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#a78bfa' }]}>
            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Taxa</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todos', stats.total)}
        {renderFilterButton('approved', 'Aprovados', stats.approved)}
        {renderFilterButton('blocked', 'Bloqueados', stats.blocked)}
        {renderFilterButton('pending', 'Pendentes', stats.pending)}
      </ScrollView>

      <FlatList
        data={getFilteredLogs()}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.logsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b7280" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shield" size={48} color="#374151" />
            <Text style={styles.emptyText}>Nenhum log encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  clearButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#161B22',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#30363D',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#21262D',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  filterButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  filterTextActive: {
    color: '#fff',
  },
  logsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  logItem: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logUserName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 6,
    maxWidth: 120,
  },
  logStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  logStatusText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  logText: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 6,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTime: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    width: 80,
  },
  expandedReason: {
    fontSize: 12,
    color: '#ef4444',
    flex: 1,
  },
  expandedValue: {
    fontSize: 11,
    color: '#9ca3af',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
});
