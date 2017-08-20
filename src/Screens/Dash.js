import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  Alert,
  StyleSheet,
  ErrorLabel,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ref, firebaseAuth } from '../../lib/firebase';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
  },
  modalContainer: {
    alignItems: 'center',
    flex: 1,
  },
  innerModal: {
    flex: 1,
    marginTop: 22,
    backgroundColor: 'snow',
    width: '80%',
    marginTop: 30,
    marginBottom: 70,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  header: {
    backgroundColor: 'black',
    color: 'white',
    fontSize: 20,
    padding: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  textInput: {
    height: 60,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderColor: '#222',
    borderWidth: 1,
    marginBottom: 16,
    width: '90%',
  },
  listTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: 'purple',
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'snow',
  },
  listButton: {

  },
  completed: {
    fontSize: 20,
    marginBottom: 10,
    color: 'green',
    fontWeight: '800',
  },
  incomplete: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '700',
    color: 'aliceblue',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'snow',
    width: '100%',
  },
  taskContainer: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingLeft: 15,
    backgroundColor: 'skyblue',
    width: '90%',
  },
  editModal: {
    flex: 1,

    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});

export default class Dash extends Component {
  static navigationOptions = {
    tabBarLabel: 'Lists',
    header: <Text style={styles.header}>My Lists</Text>,
    showIcon: false,
  };

  state: State = {
    newList: false,
    title: '',
    task: '',
    addTask: false,
    tasks: [],
    openList: false,
    myList: [],
    taskLists: [],
    filter: 'all',
    visibleTasks: [],
    editTask: false,
    error: null,
    listTitles: [],
    selectedList: {},
    key: '',
  };

  componentDidMount() {
    const user = firebaseAuth().currentUser;
    const database = ref.child(`users/${user.uid}/lists`);
    const taskRef = ref.child(`users/${user.uid}/tasks/${this.state.key}/tasks`);
    // listen for realtime changes to firebase and update state
    database.on('value', snap => {
      if (!snap.exists()) {
        return;
      }
      const res = snap.val();
      const keys = Object.keys(res);
      const listTitles = [];

      // grab object keys and create new list of objects
      keys.map(key => {
        let myTask = res[key];
        myTask.key = key;
        return listTitles.push(myTask);
      });
      this.setState({ listTitles });
    });

    taskRef.once('value').then(snap => {
      if (!snap.exists()) {
        return
      }
      this.setState({ myList: snap.val(), visibleTasks: snap.val() })
    })


  }

  signOut = () => {
    firebaseAuth().signOut();
  }

  openList(value) {
    console.log(value);
    const user = firebaseAuth().currentUser;
    const taskRef = ref.child(`users/${user.uid}/tasks/${value.key}/tasks`);
    taskRef.on('value', snap => {
      if (!snap.exists()) {
        console.log('no tasks');
        return
      }
      const tasks = snap.val().map((value, i) => {
        return value.pk = i;
      });
      console.log(tasks);

      const taskLists = [];
      const trashList = [];
      console.log(snap.val());
      this.setState({ openList: true, visibleTasks: snap.val(), myList: snap.val(), key: value.key, selectedList: value });
    })
  }

  closeList() {
    this.setState({ openList: false, myList: null, visibleTasks: null, task: '', addTask: false });
  }

  saveList() {
    const { title, tasks } = this.state;
    const user = firebaseAuth().currentUser;
    const listRef = ref.child(`users/${user.uid}/lists`);
    // save new list to firebase
    const time = new Date().getTime();
    const myList = {title}
    listRef.child(`${time}`).set(myList);
    ref.child(`users/${user.uid}/tasks/${time}`).set(tasks);
    this.setState({ task: '', error: '', title: '', tasks: [], addTask: false, newList: false});
  }

  // Save task to existing list
  saveTask() {
    const { task, myList } = this.state;
    if (task.length < 1) {
      this.setState({addTask: false});
      return;
    }
    const user = firebaseAuth().currentUser;
    const { key, tasks } = myList;
    let newTasks = [...myList.tasks, {task: task, completed: false, deleted: false}];

    // update current state optimistically to reflect server changes.
    let myNewList = Object.assign(myList, {tasks: newTasks});
    this.setState({ myList: myNewList });
    this.filterTasks(this.state.filter, newTasks);

    // save new tasks to list in firebase
    ref.child(`users/${user.uid}/lists/${key}`).update({tasks: newTasks});
    this.setState({ task: '', addTask: false });
  }

  filterTasks(filter, tasks) {
    let visibleTasks;
    switch(filter) {
      case 'completed':
        visibleTasks = tasks.filter(value => (
          value.completed === true
        ));
        this.setState({ visibleTasks, filter });
        break;

      case 'incompleted':
        visibleTasks = tasks.filter(value => (
          value.completed === false
        ));
        this.setState({ visibleTasks, filter });
        break;

      case 'all':
        this.setState({ visibleTasks: tasks, filter });
        break;

      default:
        return;
    }
  }

  // add task to new list
  addTask() {
    const { task, tasks } = this.state;
    if (task.length < 1) {
      this.setState({ addTask: false });
      return
    }
    let newTasks = [...tasks];
    newTasks.push({task: task, completed: false, deleted: false});
    this.setState({ tasks: newTasks, task: '', addTask: false });
  }

  // handle task touch action
  handleTaskTouch(value) {
    const title = value.completed ? 'Finished' : 'Not finished';
    Alert.alert(
      `${title}`,
      `${value.task}`,
      [
        {text: value.completed ? 'Mark Incomplete' : 'Mark Complete', onPress: () => this.markTask(value)},
        {text: 'Edit', onPress: () => this.editTask(value)},
        {text: 'Delete', onPress: () => console.log('OK Pressed'), style: 'cancel'},
      ],
    );
  }

  saveEditedTask() {
    const task = Object.assign(this.state.task);
    const { completed, pk, key } = task;

    // update current state optimistically to reflect server changes.
    let myNewList = Object.assign(this.state.myList);
    myNewList.tasks[pk].task = task;
    this.filterTasks(this.state.filter, myNewList.tasks);

    // Update task in firebase
    const user = firebaseAuth().currentUser;
    delete task.key;
    delete task.pk;
    delete task.list;
    console.log(task);
    ref.child(`users/${user.uid}/lists/${key}/tasks/${pk}`).update({ task: task.task });
    this.setState({ editTask: false, task: '' })
  }

  editTask(value) {
    this.setState({ task: value, editTask: true });
  }

  markTask(value) {
    if (!value.key) {
      value.completed = true;
      value.pk = this.state.myList.length;
      value.key = this.state.myList.key;

      const { completed, pk, key } = value;

      // update current state optimistically to reflect server changes.
      let myNewList = Object.assign(this.state.myList);
      myNewList.tasks.push(value);
      this.filterTasks(this.state.filter, myNewList.tasks);

      // Update task in firebase
      const user = firebaseAuth().currentUser;
      return ref.child(`users/${user.uid}/lists/${key}/tasks/${pk}`).update({completed: !completed});
    }

    const { completed, pk, key } = value;

    // update current state optimistically to reflect server changes.
    let myNewList = Object.assign(this.state.myList);
    myNewList.tasks[pk].completed = !myNewList.tasks[pk].completed;
    this.filterTasks(this.state.filter, myNewList.tasks);

    // Update task in firebase
    const user = firebaseAuth().currentUser;
    ref.child(`users/${user.uid}/lists/${key}/tasks/${pk}`).update({completed: !completed});
  }

  renderEditer() {
    const { task, editTask } = this.state;
    return (
      <View style={styles.editModal}>
        <View style={{width: '90%', alignItems: 'center'}}>
          <TextInput
            style={styles.textInput}
            onChangeText={(text: string) => {
              let newTask = Object.assign(task, {task: text});
              this.setState({ task: newTask });
            }}
            placeholder="Task"
            autoCorrect={true}
            clearButtonMode="always"
            value={task.task}
          />
          <Button
            title="Save Task"
            onPress={() => this.saveEditedTask()}
          />
        </View>
      </View>
    );
  }

  renderListContent() {
    const { visibleTasks } = this.state;

    return (
      <View style={styles.taskContainer}>
        {visibleTasks.map((value, i) => (
          <TouchableOpacity key={i} onPress={() => this.handleTaskTouch(value)} >
            <Text style={value.completed ? styles.completed : styles.incomplete}>{value.task}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // render existing list view
  renderListModal() {
    const { openList, addTask, visibleTasks, selectedList, myList, filter, editTask } = this.state;

    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={openList}
        onRequestClose={() => this.setState({ task: '', newTasks: [], addTask: false, title: '', error: ''})}
      >
        <View style={styles.innerModal}>
          <View style={styles.modalContainer}>

            {/* list title */}
            <Text style={styles.listTitle}>{selectedList.title}</Text>

            {/* list filter actions */}
            {!editTask && (
              <View style={styles.filterContainer}>
                <Button
                  title="All"
                  onPress={() => this.filterTasks('all', myList)}
                  style={{marginTop: 30}}
                  color={filter === 'all' ? 'mediumvioletred' : 'lightslategrey'}
                />
                <Button
                  title="Completed"
                  onPress={() => this.filterTasks('completed', myList)}
                  style={{marginTop: 30}}
                  color={filter === 'completed' ? 'mediumvioletred' : 'lightslategrey'}
                />
                <Button
                  title="Incompleted"
                  onPress={() => this.filterTasks('incompleted', myList)}
                  style={{marginTop: 30}}
                  color={filter === 'incompleted' ? 'mediumvioletred' : 'lightslategrey'}
                />
              </View>
            )}

            {/* list tasks */}
            {!editTask && this.renderListContent()}

            {/* edit task */}
            {editTask && this.renderEditer()}

            {/* add a new task */}
            <Button
              title="Add Task"
              onPress={() => this.setState({ addTask: true })}
              style={{marginTop: 30}}
              color="darkorchid"
              disabled={editTask}
            />
            {addTask && (
              <View style={{width: '100%', alignItems: 'center'}}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={(value: string) => this.setState({ task: value })}
                  placeholder="Task"
                  autoCorrect={true}
                  clearButtonMode="always"
                />
                <Button
                  title="Save Task"
                  onPress={() => this.saveTask()}
                  disabled={editTask}
                />
              </View>
            )}

            {/* close list view */}
            <Button
              title="Close"
              onPress={() => this.closeList()}
              color="red"
              disabled={editTask}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // render view to compose new list
  renderNewListModal() {
    const { error, title, task, addTask, tasks, saveTitle  } = this.state;
    const disable = title.length < 1;

    return (
      <Modal
        animationType={'slide'}
        visible={this.state.showDateModal}
        onRequestClose={() => this.setState({ task: '', newTasks: [], addTask: false, title: '', error: ''})}
      >
        <View style={styles.innerModal}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Add a title to your list</Text>

            {/* Add List Title */}
            {!saveTitle && (
              <TextInput
                style={styles.textInput}
                onChangeText={(value: string) => this.setState({ title: value })}
                placeholder="List title"
                autoCorrect={true}
                clearButtonMode="always"
              />
            )}
            {saveTitle && <Text style={styles.listTitle}>{this.state.title}</Text>}
            <Button
              onPress={() => {
                this.setState({ saveTitle: !saveTitle })
              }}
              title={saveTitle ? 'Edit Title' : 'Save Title'}
              disabled={title.length < 1}
            />

            {/* render list items */}
            <View style={{marginTop: 30, marginBottom: 10}}>
              {tasks.map((value, i) => (
                  <Text style={{fontSize: 16, marginBottom: 10}}>{value.task}</Text>
              ))}
            </View>

            {/* add new task */}
            <Button
              title="Add Task"
              onPress={() => this.setState({ addTask: true })}
              style={{marginTop: 30}}
            />
            {addTask && (
              <View style={{width: '100%', alignItems: 'center'}}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={(value: string) => this.setState({ task: value })}
                  placeholder="Task"
                  autoCorrect={true}
                  clearButtonMode="always"
                />
                <Button
                  title="Save Task"
                  onPress={() => this.addTask()}
                />
              </View>
            )}

            {/* newList actions */}
            <View style={{alignItems: 'center', flexDirection: 'row', marginTop: 30}}>
              <Button
                title="Save"
                onPress={() => this.saveList()}
                color="green"
                disabled={title.length < 1}
              />
              <Button
                title="Cancel"
                onPress={() =>
                  this.setState({
                    newList: false,
                    title: '',
                    task: '',
                    addTask: false,
                    error: '',
                    tasks: [],
                  })}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    const { newList, listTitles, openList } = this.state;
    return (
      <View style={styles.container}>
        {newList && this.renderNewListModal()}
        {openList && this.renderListModal()}
        {listTitles.map((value, i) => (
          <View style={{paddingTop: 4, paddingBottom: 4, width: '90%', marginTop: 4, marginBottom: 4, backgroundColor: 'white'}}>
            <TouchableOpacity key={i} onPress={() => this.openList(listTitles[i])} >
                <Text style={{fontSize: 18, textAlign: 'center'}}>{value.title}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Button
          onPress={() => this.setState({ newList: true })}
          title="Create New List"
        />
      </View>
    )
  }
}
