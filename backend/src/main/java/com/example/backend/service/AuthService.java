
package com.example.backend.service;

import com.example.backend.entity.AppUser;
import com.example.backend.entity.RegistrationProfile;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.RegistrationProfileRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RegistrationProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            RegistrationProfileRepository profileRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AppUser register(Map<String, String> request) {
        String email = request.getOrDefault("email", "")
                .trim().toLowerCase();
        String password = request.getOrDefault("password", "");

        if (email.isBlank() || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Enter a valid email and a password of at least 8 characters.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists.");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");

        AppUser savedUser = userRepository.save(user);

        RegistrationProfile profile = new RegistrationProfile();
        profile.setUser(savedUser);

        profile.setName(request.get("name"));
        profile.setPhone(request.get("phone"));
        profile.setIntent(request.get("intent"));
        profile.setPropertyType(request.get("propertyType"));
        profile.setState(request.get("state"));
        profile.setCity(request.get("city"));
        profile.setLocality(request.get("locality"));
        profile.setBudget(request.get("budget"));
        profile.setBedrooms(request.get("bedrooms"));
        profile.setAddress(request.get("address"));
        profile.setPincode(request.get("pincode"));
        profile.setPrice(request.get("price"));
        profile.setPropertySize(request.get("propertySize"));
        profile.setListingUrl(request.get("listingUrl"));
        profile.setDocumentUrl(request.get("documentUrl"));
        profile.setDescription(request.get("description"));
        profile.setFurnishing(request.get("furnishing"));
        profile.setPossessionTimeline(request.get("possessionTimeline"));
        profile.setMoveInDate(request.get("moveInDate"));
        profile.setSharingPreference(request.get("sharingPreference"));
        profile.setMealsPreference(request.get("mealsPreference"));
        profile.setLandType(request.get("landType"));
        profile.setIntendedUse(request.get("intendedUse"));
        profile.setLeaseDuration(request.get("leaseDuration"));
        profile.setAvailabilityDate(request.get("availabilityDate"));
        profile.setOwnershipStatus(request.get("ownershipStatus"));

        profileRepository.save(profile);

        return savedUser;
    }

    public boolean verifyPassword(String email, String password) {
        if (email == null || password == null) {
            return false;
        }

        return userRepository.findByEmail(email.trim().toLowerCase())
                .map(user -> passwordEncoder.matches(
                        password, user.getPassword()))
                .orElse(false);
    }
}
