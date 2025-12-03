import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { testAllEndpoints } from '../services/netflixLocalApi';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

interface TestResult {
    status: 'pending' | 'success' | 'error';
    data: any;
    error: any;
}

interface TestResults {
    search: TestResult;
    details: TestResult;
    episodes: TestResult;
    stream: TestResult;
}

const NetflixApiTest: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<TestResults | null>(null);

    const runTests = async () => {
        setTesting(true);
        setResults(null);

        try {
            const testResults = await testAllEndpoints();
            setResults(testResults);
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setTesting(false);
        }
    };

    const renderStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={20} color="#10B981" />;
            case 'error':
                return <XCircle size={20} color="#EF4444" />;
            case 'pending':
                return <AlertCircle size={20} color="#6B7280" />;
            default:
                return null;
        }
    };

    const renderEndpointResult = (name: string, result: TestResult) => {
        return (
            <View key={name} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                    {renderStatusIcon(result.status)}
                    <Text style={styles.endpointName}>{name}</Text>
                    <Text style={[
                        styles.statusText,
                        result.status === 'success' && styles.statusSuccess,
                        result.status === 'error' && styles.statusError,
                    ]}>
                        {result.status.toUpperCase()}
                    </Text>
                </View>

                {result.status === 'success' && result.data && (
                    <View style={styles.dataContainer}>
                        <Text style={styles.dataLabel}>Response:</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.dataScroll}
                        >
                            <Text style={styles.dataText}>
                                {typeof result.data === 'string'
                                    ? result.data
                                    : JSON.stringify(result.data, null, 2).substring(0, 500)
                                }
                                {JSON.stringify(result.data).length > 500 && '...'}
                            </Text>
                        </ScrollView>

                        {/* Display counts for arrays */}
                        {Array.isArray(result.data) && (
                            <Text style={styles.countText}>
                                {result.data.length} items
                            </Text>
                        )}
                        {result.data?.episodes && Array.isArray(result.data.episodes) && (
                            <Text style={styles.countText}>
                                {result.data.episodes.length} episodes
                            </Text>
                        )}
                        {result.data?.searchResult && Array.isArray(result.data.searchResult) && (
                            <Text style={styles.countText}>
                                {result.data.searchResult.length} results
                            </Text>
                        )}
                    </View>
                )}

                {result.status === 'error' && result.error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorLabel}>Error:</Text>
                        <Text style={styles.errorText}>
                            {result.error.message || JSON.stringify(result.error)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Netflix API Test</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Testing localhost:3000/api</Text>
                <Text style={styles.infoText}>
                    This will test all 4 endpoints:{'\n'}
                    • /api/search?q=Stranger{'\n'}
                    • /api/details/80057281{'\n'}
                    • /api/episodes/80057281{'\n'}
                    • /api/stream?id=80057281&hash=test
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.testButton, testing && styles.testButtonDisabled]}
                onPress={runTests}
                disabled={testing}
            >
                {testing ? (
                    <>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.testButtonText}>Testing...</Text>
                    </>
                ) : (
                    <Text style={styles.testButtonText}>Run Tests</Text>
                )}
            </TouchableOpacity>

            <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                {results && (
                    <>
                        {renderEndpointResult('Search', results.search)}
                        {renderEndpointResult('Details', results.details)}
                        {renderEndpointResult('Episodes', results.episodes)}
                        {renderEndpointResult('Stream', results.stream)}

                        {/* Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Summary</Text>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <CheckCircle size={16} color="#10B981" />
                                    <Text style={styles.summaryText}>
                                        {Object.values(results).filter(r => r.status === 'success').length} Passed
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <XCircle size={16} color="#EF4444" />
                                    <Text style={styles.summaryText}>
                                        {Object.values(results).filter(r => r.status === 'error').length} Failed
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E50914',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoBox: {
        margin: 20,
        padding: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#E50914',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#a3a3a3',
        lineHeight: 18,
    },
    testButton: {
        backgroundColor: '#E50914',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    testButtonDisabled: {
        opacity: 0.6,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        flex: 1,
        padding: 20,
    },
    resultCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    endpointName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    statusSuccess: {
        color: '#10B981',
    },
    statusError: {
        color: '#EF4444',
    },
    dataContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#0a0a0a',
        borderRadius: 4,
    },
    dataLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
        marginBottom: 5,
    },
    dataScroll: {
        maxHeight: 150,
    },
    dataText: {
        fontSize: 11,
        color: '#a3a3a3',
        fontFamily: 'monospace',
    },
    countText: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 5,
        fontWeight: 'bold',
    },
    errorContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#1a0000',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    errorLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 5,
    },
    errorText: {
        fontSize: 11,
        color: '#EF4444',
        fontFamily: 'monospace',
    },
    summaryCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#E50914',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 20,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    summaryText: {
        fontSize: 14,
        color: '#a3a3a3',
    },
});

export default NetflixApiTest;
