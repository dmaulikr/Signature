const backgroundColor = '#FFFFFF'
const errorColor = '#FF0000'  
const mainColor = '#9E1854'
const mainColorTouch = '#590E2F'

export default {

  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: mainColor,
  },

  buttonSignature: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: mainColor,
    margin: 20
  },

  buttonSignatureText: {
    color: '#FFFFFF'
  },

  color: mainColor,

  containerButton: {
    flexDirection: 'row',
    padding: 20
  },

  childContainer: {
    width: '100%',
    padding: 20,
  },

  disconnectionButton: {
    margin: 20
  },

  document: {
    color: '#9E1854',
    fontWeight: 'bold',
  },

  documentView: {
    marginBottom: 20
  },

  flexColumn: {
    flex: 1,
    flexDirection: 'column'
  },

  flexRow: {
    flex: 0,
    flexDirection: 'row'
  },

  flexRowButtons: {
    backgroundColor: '#EBE8F1',
    flex: 0,
    flexDirection: 'row',
  },

  flexRowDocument: {
    flex: 0,
    flexDirection: 'row',
    paddingBottom: 10
  },

  header: {
    backgroundColor: mainColor
  },

  headerTitle: {
    bottom: 0,
    color: '#FFFFFF'
  },

  icon: {
    marginRight: 5
  },

  mainContainer: {
    flex: 1
  },

  noSignatureAvailableContainer: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },

  noDocument: {
    fontWeight: 'bold',
    fontStyle: 'italic'
  },

  parentContainer: {
    backgroundColor: backgroundColor,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 'auto'
  },

  preSignatureText: {
    marginBottom: 20
  },

  searchSignatureText: {
    marginTop: 20,
    marginBottom: 20
  },

  signature: {
    flex: 1,
    borderColor: '#000033',
    borderWidth: 1,
  },

  signatureText: {
    marginBottom: 20
  },

  textInput: {
    borderColor: mainColor,
    borderWidth: 1,
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  text: {
    marginBottom: 20
  },

  touchColor: mainColorTouch

}
