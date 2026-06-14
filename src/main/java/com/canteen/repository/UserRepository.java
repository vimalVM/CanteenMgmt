package com.canteen.repository;

import com.canteen.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(com.canteen.model.Role role);
    List<User> findByNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(String name, String regNumber);
}
