import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 190,
    height: 190,
    resizeMode: 'contain',
    marginBottom: 5,
    marginTop: -50,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  
});
