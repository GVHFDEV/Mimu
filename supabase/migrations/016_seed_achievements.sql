-- Seed initial achievements
INSERT INTO achievements (id, title, description, icon, category, criteria, xp_reward) VALUES
('first_steps', 'Primeiros Passos', 'Complete sua primeira atividade', '🏆', 'milestone', '{"total_activities": 1}', 10),
('dedicated_week', 'Semana Dedicada', 'Mantenha um streak de 7 dias', '🔥', 'streak', '{"streak_days": 7}', 50),
('dedicated_month', 'Mês Exemplar', 'Mantenha um streak de 30 dias', '⭐', 'streak', '{"streak_days": 30}', 200),
('century_club', 'Clube dos 100', 'Complete 100 atividades', '💯', 'milestone', '{"total_activities": 100}', 100),
('half_thousand', 'Meio Milhar', 'Complete 500 atividades', '🌟', 'milestone', '{"total_activities": 500}', 250),
('morning_person', 'Madrugador', 'Complete 50 atividades matinais', '🌅', 'specialty', '{"morning_activities": 50}', 75),
('night_owl', 'Coruja Noturna', 'Complete 50 atividades noturnas', '🌙', 'specialty', '{"night_activities": 50}', 75),
('health_guardian', 'Guardião da Saúde', 'Registre 10 eventos de saúde', '💚', 'health', '{"health_events": 10}', 100),
('multi_pet_master', 'Mestre Multi-Pet', 'Cuide de 3 ou mais pets', '🐾', 'collection', '{"total_pets": 3}', 150),
('perfect_week', 'Semana Perfeita', 'Complete todas as 63 atividades em uma semana', '✨', 'challenge', '{"weekly_activities": 63}', 300)
ON CONFLICT (id) DO NOTHING;
