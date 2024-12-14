import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useContext,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import Container from "../components/Container";
import { fetchUsers } from "../store/userSlice";
import LogoutButton from "../components/LogoutButton";
import { useDispatch, useSelector } from "react-redux";

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { users, loading, error, page, pageSize } = useSelector(
    (state) => state.users
  );
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    if (page === 1) {
      dispatch(fetchUsers(page, pageSize));
    }
  }, [dispatch, page, pageSize]);

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.first.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((user) => user.dob.age >= ageFilter);

  const isNoData = filteredUsers.length === 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <LogoutButton />,
      headerTitle: Platform.OS === "ios" ? "" : "Home",
    });
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("UserDetail", { user: item })}
    >
      <Text style={styles.itemText}>
        {item.name.first} {item.name.last}, Age: {item.dob.age}
      </Text>
    </TouchableOpacity>
  );

  const loadMoreUsers = useCallback(() => {
    if (!loading && !isFetchingMore && !isNoData) {
      setIsFetchingMore(true);
      dispatch(fetchUsers(page + 1, pageSize));
    }
  }, [loading, isFetchingMore, dispatch, page, pageSize, isNoData]);

  const handleSearch = (text) => {
    setSearch(text);
    dispatch(fetchUsers(1, pageSize));
  };

  useEffect(() => {
    if (!loading && isFetchingMore) {
      setIsFetchingMore(false);
    }
  }, [loading, isFetchingMore]);

  return (
    <>
      <View style={styles.ageFilterContainer}>
        <Text>Filter by age:</Text>
        <TextInput
          style={styles.ageFilterInput}
          placeholder="Filter by age"
          value={ageFilter.toString()}
          onChangeText={(text) => setAgeFilter(Number(text) || 0)}
          keyboardType="numeric"
        />
      </View>
      <Container>
        <View style={styles.welcomeContainer}>
          <Text>Welcome, {user?.email || "Guest"}!</Text>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name or email"
          value={search}
          onChangeText={handleSearch}
        />
        <Text>Age: {ageFilter}</Text>

        {error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <>
            {isNoData ? (
              <View style={styles.noDataContainer}>
                <Text>No users found for this filter</Text>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={(item) => item.login.uuid}
                onEndReached={loadMoreUsers}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingMore ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : (
                    <View style={{ padding: 10 }}>
                      {users.length === 0 && <Text>No more users to load</Text>}
                    </View>
                  )
                }
              />
            )}

            {loading && !isFetchingMore && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </>
        )}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  welcomeContainer: { marginBottom: 15 },
  ageFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 18,
  },
  ageFilterInput: {
    flex: 1,
    marginLeft: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  searchBar: { marginBottom: 16, padding: 8, borderWidth: 1, borderRadius: 4 },
  itemText: { padding: 10, fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "#ff5555",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default HomeScreen;
