import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import Theme from '../../theme/Theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface FlockInfo {
  quantity: string;
  flockType: string;
  arrivalDate: string;
  gender: string;
  supplier: string;
  averageWeight: string;
  price: string;
  dateOfBirth: string;
}

interface Props {
  title: string;
  initialData: FlockInfo;
  customLabels?: Partial<Record<keyof FlockInfo, string>>;
  fieldsPerRow?: number;
}

const ExpandableCard: React.FC<Props> = ({
  title,
  initialData,
  fieldsPerRow = 2,
  customLabels = {},
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(initialData);
  const [showDatePicker, setShowDatePicker] = useState<{
    key: keyof FlockInfo;
    visible: boolean;
  }>({ key: 'arrivalDate', visible: false });

  const formatLabel = (key: keyof FlockInfo) =>
    customLabels[key] ??
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const handleChange = (key: keyof FlockInfo, value: string) => {
    setData({ ...data, [key]: value });
  };

  const handleSave = () => {
    setEditing(false);
    console.log('Saved data:', data);
  };

  const handleDiscard = () => {
    setData(initialData);
    setEditing(false);
  };

  const handleDateSelect = (key: keyof FlockInfo, date: Date | undefined) => {
    if (date) {
      handleChange(key, date.toISOString().split('T')[0]); // store as yyyy-mm-dd
    }
    setShowDatePicker({ key, visible: false });
  };

  // Split data into rows
  const entries = Object.keys(data);
  const rows: (keyof FlockInfo)[][] = [];
  for (let i = 0; i < entries.length; i += fieldsPerRow) {
    const row: (keyof FlockInfo)[] = [];
    for (let j = 0; j < fieldsPerRow; j++) {
      const key = entries[i + j] as keyof FlockInfo;
      if (key) row.push(key);
    }
    rows.push(row);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>{title}</Text>
        <Image
          source={expanded ? Theme.icons.upload : Theme.icons.dropdown}
          style={styles.icon}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {rows.map((rowKeys, idx) => (
              <View key={idx} style={styles.row}>
                {rowKeys.map(key => {
                  const isDateField =
                    key === 'arrivalDate' || key === 'dateOfBirth';
                  const isWeightField = key === 'averageWeight';
                  return (
                    <View key={key} style={styles.fieldContainer}>
                      <Text style={styles.label}>{formatLabel(key)}</Text>

                      {editing ? (
                        isDateField ? (
                          <TouchableOpacity
                            style={[
                              styles.input,
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              },
                            ]}
                            onPress={() =>
                              setShowDatePicker({ key, visible: true })
                            }
                          >
                            <Text>{data[key]}</Text>
                            <Image
                              source={Theme.icons.date}
                              style={{
                                width: 20,
                                height: 20,
                                tintColor: Theme.colors.buttonPrimary,
                              }}
                            />
                          </TouchableOpacity>
                        ) : (
                          <TextInput
                            style={styles.input}
                            value={data[key]}
                            onChangeText={text => handleChange(key, text)}
                          />
                        )
                      ) : (
                        <Text style={styles.value}>
                          {isWeightField ? `${data[key]}` : data[key]}
                        </Text>
                      )}

                      {/* Date Picker */}
                      {showDatePicker.visible && showDatePicker.key === key && (
                        <DateTimePicker
                          value={data[key] ? new Date(data[key]) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(e, date) => {
                            if (Platform.OS === 'android')
                              setShowDatePicker({ key, visible: false });
                            handleDateSelect(key, date);
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.buttonRow}>
              {editing && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: Theme.colors.white,
                      borderWidth: 1,
                      borderColor: Theme.colors.buttonPrimary,
                    },
                  ]}
                  onPress={handleDiscard}
                >
                  <Text style={styles.buttonText}>Discard</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Theme.colors.buttonPrimary },
                ]}
                onPress={editing ? handleSave : () => setEditing(true)}
              >
                <Text style={styles.saveText}>{editing ? 'Save' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.white,
    borderRadius: 15,
    marginHorizontal: 4,
    marginTop: 7,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    elevation: 4,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.blue,
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Theme.colors.blue,
  },

  content: {
    padding: 14,

    borderTopWidth: 1,
    borderTopColor: Theme.colors.buttonPrimary,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  fieldContainer: {
    flex: 1,
    marginRight: 10,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.success,
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
    paddingVertical: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },

  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },

  buttonText: {
    color: Theme.colors.buttonPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  saveText: {
    color: Theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ExpandableCard;
