package com.multiwiki.user;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.multiwiki.auth.services.PasswordService;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class UserService implements UserDetailsService{
    @Autowired
    private UserRepository userRepository;

    @Autowired 
    private PasswordService passwordService;

    public Optional<User> getById(int id){
        return this.userRepository.findById(id);
    }

    public Optional<User> getByUsername(String username){
        return this.userRepository.findByUsername(username);
    }

    public Optional<User> getByEmail(String email){
        return this.userRepository.findByEmail(email);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public User createUser(String username, String email, String password) throws RuntimeException{
        if(this.userRepository.existsByEmail(email) || this.userRepository.existsByUsername(username))
            throw new EntityExistsException("User already exists with this username or email");

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(this.passwordService.hashPasword(password));

        return userRepository.save(user);
    }

    public User updateUser(User user){
        if(!this.userRepository.existsById(user.getId()))
            throw new EntityNotFoundException("User is not foun with id - " + user.getId());
        return userRepository.save(user);
    }

    public boolean existsByUsername(String username){
        return this.userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email){
        return this.userRepository.existsByEmail(email);
    }
}
