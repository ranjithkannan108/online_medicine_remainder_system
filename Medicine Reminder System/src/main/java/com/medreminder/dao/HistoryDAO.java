package com.medreminder.dao;

import com.medreminder.model.History;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HistoryDAO {

    public List<History> getAllByUser(int userId) {
        List<History> list = new ArrayList<>();
        String sql = "SELECT * FROM history WHERE user_id = ? ORDER BY taken_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapHistory(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int add(History h) {
        String sql = "INSERT INTO history (user_id, medicine_id, medicine_name, dosage, action_type) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, h.getUserId());
            ps.setInt(2, h.getMedicineId());
            ps.setString(3, h.getMedicineName());
            ps.setString(4, h.getDosage());
            ps.setString(5, h.getActionType());
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            if (keys.next()) return keys.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public boolean clearAll(int userId) {
        String sql = "DELETE FROM history WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            return ps.executeUpdate() >= 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private History mapHistory(ResultSet rs) throws SQLException {
        History h = new History();
        h.setId(rs.getInt("id"));
        h.setUserId(rs.getInt("user_id"));
        h.setMedicineId(rs.getInt("medicine_id"));
        h.setMedicineName(rs.getString("medicine_name"));
        h.setDosage(rs.getString("dosage"));
        h.setActionType(rs.getString("action_type"));
        h.setTakenAt(rs.getString("taken_at"));
        return h;
    }
}
