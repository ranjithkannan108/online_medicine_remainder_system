package com.medreminder.dao;

import com.medreminder.model.Medicine;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MedicineDAO {

    public List<Medicine> getAllByUser(int userId) {
        List<Medicine> list = new ArrayList<>();
        String sql = "SELECT * FROM medicines WHERE user_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapMedicine(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Medicine getById(int id) {
        String sql = "SELECT * FROM medicines WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapMedicine(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int add(Medicine med) {
        String sql = "INSERT INTO medicines (user_id, name, dosage, quantity, frequency, start_date, end_date, times, notes, min_stock_alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, med.getUserId());
            ps.setString(2, med.getName());
            ps.setString(3, med.getDosage());
            ps.setInt(4, med.getQuantity());
            ps.setString(5, med.getFrequency());
            ps.setString(6, med.getStartDate() != null && !med.getStartDate().isEmpty() ? med.getStartDate() : null);
            ps.setString(7, med.getEndDate() != null && !med.getEndDate().isEmpty() ? med.getEndDate() : null);
            ps.setString(8, med.getTimes());
            ps.setString(9, med.getNotes());
            ps.setInt(10, med.getMinStockAlert());
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            if (keys.next()) return keys.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public boolean update(Medicine med) {
        String sql = "UPDATE medicines SET name=?, dosage=?, quantity=?, frequency=?, start_date=?, end_date=?, times=?, notes=?, min_stock_alert=? WHERE id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, med.getName());
            ps.setString(2, med.getDosage());
            ps.setInt(3, med.getQuantity());
            ps.setString(4, med.getFrequency());
            ps.setString(5, med.getStartDate() != null && !med.getStartDate().isEmpty() ? med.getStartDate() : null);
            ps.setString(6, med.getEndDate() != null && !med.getEndDate().isEmpty() ? med.getEndDate() : null);
            ps.setString(7, med.getTimes());
            ps.setString(8, med.getNotes());
            ps.setInt(9, med.getMinStockAlert());
            ps.setInt(10, med.getId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM medicines WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean reduceQuantity(int id) {
        String sql = "UPDATE medicines SET quantity = quantity - 1 WHERE id = ? AND quantity > 0";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Medicine mapMedicine(ResultSet rs) throws SQLException {
        Medicine m = new Medicine();
        m.setId(rs.getInt("id"));
        m.setUserId(rs.getInt("user_id"));
        m.setName(rs.getString("name"));
        m.setDosage(rs.getString("dosage"));
        m.setQuantity(rs.getInt("quantity"));
        m.setFrequency(rs.getString("frequency"));
        m.setStartDate(rs.getString("start_date"));
        m.setEndDate(rs.getString("end_date"));
        m.setTimes(rs.getString("times"));
        m.setNotes(rs.getString("notes"));
        m.setMinStockAlert(rs.getInt("min_stock_alert"));
        return m;
    }
}
