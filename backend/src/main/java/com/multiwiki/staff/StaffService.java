package com.multiwiki.staff;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.staff.requests.CreateStaffRequest;

@Service
public class StaffService{
    @Autowired
    private StaffRepository staffRepository;

    public List<Staff> findByWikiId(int wikiId){
        return this.staffRepository.findByWikiId(wikiId);
    }

    public Optional<Staff> findByWikiIdAndUserId(int wikiId, int userId){
        return this.staffRepository.findByWikiIdAndUserId(wikiId, userId);
    }

    public Staff create(CreateStaffRequest request) throws Exception, AccessDeniedException {
        if(this.staffRepository.existsByWikiIdAndUserId(request.getWiki().getId(), request.getUser().getId()))
            throw new AccessDeniedException("User is have role");

        try {
            EnumStaffRole role = EnumStaffRole.valueOf(request.getRole());
            Staff staff = new Staff();
            staff.setWikiId(request.getWiki().getId());
            staff.setRole(role);
            staff.setUserId(request.getUser().getId());
            staff.setCreatedBy(request.getRequester().getId());
            return this.staffRepository.save(staff);
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Invalid role: " + request.getRole());
        }
    }

    public Staff update(Staff entity) {
        return this.staffRepository.save(entity);
    }

    public void delete(Staff entity) throws Exception {
        this.staffRepository.delete(entity);
    }

    public boolean isHaveStaff(int wikiId, int userId){
        Optional<Staff> staff = this.staffRepository.findByWikiIdAndUserId(wikiId, userId);
        return staff.isPresent();
    }

    public boolean isOwner(int wikiId, int userId){
        Optional<Staff> staff = this.staffRepository.findByWikiIdAndUserId(wikiId, userId);
        return staff.isPresent() ? staff.get().getRole().equals(EnumStaffRole.OWNER.name()) : false;
    }

    public EnumStaffRole getRole(int wikiId, int userId) throws IllegalArgumentException{
        Optional<Staff> staff = this.staffRepository.findByWikiIdAndUserId(wikiId, userId);
        if(staff.isEmpty())
            throw new IllegalArgumentException("This user is not have staff");

        return EnumStaffRole.valueOf(staff.get().getRole());
    }
}
