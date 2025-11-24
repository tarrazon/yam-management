import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download, FileCode } from "lucide-react";

export default function WordPressPluginGuide() {
  const [copiedFile, setCopiedFile] = useState(null);

  const copyToClipboard = async (text, fileName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const downloadAllFiles = () => {
    const files = [
      { name: 'crm-lmnp-sync.php', content: mainPluginFile },
      { name: 'includes/class-crm-api.php', content: apiClassFile },
      { name: 'includes/class-lot-post-type.php', content: postTypeFile },
      { name: 'includes/class-sync-manager.php', content: syncManagerFile },
      { name: 'admin/settings-page.php', content: settingsPageFile },
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  // Fichier principal du plugin
  const mainPluginFile = `<?php
/**
 * Plugin Name: CRM LMNP Sync
 * Plugin URI: https://votre-site.com
 * Description: Synchronise automatiquement les lots LMNP depuis votre CRM Y'am Asset Management
 * Version: 1.0.0
 * Author: Votre Nom
 * Author URI: https://votre-site.com
 * License: GPL v2 or later
 * Text Domain: crm-lmnp-sync
 */

// Sécurité : bloquer l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Constantes du plugin
define('CRM_LMNP_VERSION', '1.0.0');
define('CRM_LMNP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CRM_LMNP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Inclure les classes
require_once CRM_LMNP_PLUGIN_DIR . 'includes/class-crm-api.php';
require_once CRM_LMNP_PLUGIN_DIR . 'includes/class-lot-post-type.php';
require_once CRM_LMNP_PLUGIN_DIR . 'includes/class-sync-manager.php';
require_once CRM_LMNP_PLUGIN_DIR . 'admin/settings-page.php';

/**
 * Activation du plugin
 */
function crm_lmnp_activate() {
    // Créer le custom post type
    CRM_LMNP_Lot_Post_Type::register();
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Planifier la synchronisation automatique (toutes les 2 heures)
    if (!wp_next_scheduled('crm_lmnp_sync_cron')) {
        wp_schedule_event(time(), 'twicedaily', 'crm_lmnp_sync_cron');
    }
}
register_activation_hook(__FILE__, 'crm_lmnp_activate');

/**
 * Désactivation du plugin
 */
function crm_lmnp_deactivate() {
    // Supprimer la tâche cron
    wp_clear_scheduled_hook('crm_lmnp_sync_cron');
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'crm_lmnp_deactivate');

/**
 * Initialisation du plugin
 */
function crm_lmnp_init() {
    // Enregistrer le custom post type
    CRM_LMNP_Lot_Post_Type::register();
    
    // Charger les traductions
    load_plugin_textdomain('crm-lmnp-sync', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', 'crm_lmnp_init');

/**
 * Hook pour la synchronisation automatique
 */
add_action('crm_lmnp_sync_cron', array('CRM_LMNP_Sync_Manager', 'sync_lots'));

/**
 * Ajouter un bouton de synchronisation manuelle dans l'admin
 */
function crm_lmnp_admin_bar_sync_button($wp_admin_bar) {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    $args = array(
        'id'    => 'crm-lmnp-sync',
        'title' => '🔄 Sync CRM LMNP',
        'href'  => wp_nonce_url(admin_url('admin.php?action=crm_lmnp_manual_sync'), 'crm_lmnp_sync'),
    );
    $wp_admin_bar->add_node($args);
}
add_action('admin_bar_menu', 'crm_lmnp_admin_bar_sync_button', 100);

/**
 * Gérer la synchronisation manuelle
 */
function crm_lmnp_handle_manual_sync() {
    if (!isset($_GET['action']) || $_GET['action'] !== 'crm_lmnp_manual_sync') {
        return;
    }
    
    if (!current_user_can('manage_options')) {
        wp_die('Accès refusé');
    }
    
    check_admin_referer('crm_lmnp_sync');
    
    $result = CRM_LMNP_Sync_Manager::sync_lots();
    
    if ($result['success']) {
        wp_redirect(admin_url('edit.php?post_type=lot_lmnp&sync_success=1&count=' . $result['count']));
    } else {
        wp_redirect(admin_url('edit.php?post_type=lot_lmnp&sync_error=1&message=' . urlencode($result['message'])));
    }
    exit;
}
add_action('admin_init', 'crm_lmnp_handle_manual_sync');

/**
 * Afficher les messages de synchronisation
 */
function crm_lmnp_admin_notices() {
    if (isset($_GET['sync_success']) && $_GET['sync_success'] == '1') {
        $count = isset($_GET['count']) ? intval($_GET['count']) : 0;
        echo '<div class="notice notice-success is-dismissible"><p>';
        printf('✅ Synchronisation réussie : %d lots mis à jour.', $count);
        echo '</p></div>';
    }
    
    if (isset($_GET['sync_error']) && $_GET['sync_error'] == '1') {
        $message = isset($_GET['message']) ? sanitize_text_field($_GET['message']) : 'Erreur inconnue';
        echo '<div class="notice notice-error is-dismissible"><p>';
        printf('❌ Erreur de synchronisation : %s', $message);
        echo '</p></div>';
    }
}
add_action('admin_notices', 'crm_lmnp_admin_notices');`;

  // Classe API
  const apiClassFile = `<?php
/**
 * Classe pour gérer les appels API vers Y'am Asset Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class CRM_LMNP_API {
    
    private static $api_url = 'https://api.base44.com'; // Remplacer par l'URL réelle
    private static $api_token = null;
    
    /**
     * Récupérer le token API depuis les options
     */
    private static function get_api_token() {
        if (self::$api_token === null) {
            self::$api_token = get_option('crm_lmnp_api_token', '');
        }
        return self::$api_token;
    }
    
    /**
     * Récupérer tous les lots publiés
     */
    public static function get_lots() {
        $token = self::get_api_token();
        
        if (empty($token)) {
            return array(
                'success' => false,
                'message' => 'Token API non configuré',
                'data' => array()
            );
        }
        
        $response = wp_remote_get(
            self::$api_url . '/entities/LotLMNP',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            )
        );
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => $response->get_error_message(),
                'data' => array()
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data) {
            return array(
                'success' => false,
                'message' => 'Impossible de décoder la réponse API',
                'data' => array()
            );
        }
        
        // Filtrer uniquement les lots publiés sur WordPress
        $lots_publies = array_filter($data, function($lot) {
            return isset($lot['en_ligne_wordpress']) && $lot['en_ligne_wordpress'] === true;
        });
        
        return array(
            'success' => true,
            'message' => 'Lots récupérés avec succès',
            'data' => array_values($lots_publies)
        );
    }
    
    /**
     * Récupérer les résidences
     */
    public static function get_residences() {
        $token = self::get_api_token();
        
        if (empty($token)) {
            return array();
        }
        
        $response = wp_remote_get(
            self::$api_url . '/entities/ResidenceGestion',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            )
        );
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data ? $data : array();
    }
}`;

  // Classe Custom Post Type
  const postTypeFile = `<?php
/**
 * Enregistrement du Custom Post Type pour les lots LMNP
 */

if (!defined('ABSPATH')) {
    exit;
}

class CRM_LMNP_Lot_Post_Type {
    
    /**
     * Enregistrer le custom post type
     */
    public static function register() {
        $labels = array(
            'name'                  => 'Lots LMNP',
            'singular_name'         => 'Lot LMNP',
            'menu_name'             => 'Lots LMNP',
            'add_new'               => 'Ajouter un lot',
            'add_new_item'          => 'Ajouter un nouveau lot',
            'edit_item'             => 'Modifier le lot',
            'new_item'              => 'Nouveau lot',
            'view_item'             => 'Voir le lot',
            'search_items'          => 'Rechercher des lots',
            'not_found'             => 'Aucun lot trouvé',
            'not_found_in_trash'    => 'Aucun lot dans la corbeille',
        );
        
        $args = array(
            'labels'                => $labels,
            'public'                => true,
            'has_archive'           => true,
            'show_in_menu'          => true,
            'show_in_rest'          => true,
            'menu_icon'             => 'dashicons-building',
            'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'rewrite'               => array('slug' => 'lots-lmnp'),
            'capability_type'       => 'post',
        );
        
        register_post_type('lot_lmnp', $args);
        
        // Enregistrer les taxonomies
        self::register_taxonomies();
        
        // Ajouter les meta boxes personnalisées
        add_action('add_meta_boxes', array(__CLASS__, 'add_meta_boxes'));
    }
    
    /**
     * Enregistrer les taxonomies
     */
    private static function register_taxonomies() {
        // Taxonomie pour les résidences
        register_taxonomy('residence', 'lot_lmnp', array(
            'label'         => 'Résidences',
            'rewrite'       => array('slug' => 'residence'),
            'hierarchical'  => true,
            'show_in_rest'  => true,
        ));
        
        // Taxonomie pour le statut
        register_taxonomy('statut_lot', 'lot_lmnp', array(
            'label'         => 'Statut',
            'rewrite'       => array('slug' => 'statut'),
            'hierarchical'  => true,
            'show_in_rest'  => true,
        ));
    }
    
    /**
     * Ajouter les meta boxes
     */
    public static function add_meta_boxes() {
        add_meta_box(
            'lot_lmnp_details',
            'Détails du lot',
            array(__CLASS__, 'render_details_meta_box'),
            'lot_lmnp',
            'normal',
            'high'
        );
        
        add_meta_box(
            'lot_lmnp_financier',
            'Informations financières',
            array(__CLASS__, 'render_financial_meta_box'),
            'lot_lmnp',
            'side',
            'default'
        );
    }
    
    /**
     * Afficher la meta box des détails
     */
    public static function render_details_meta_box($post) {
        $reference = get_post_meta($post->ID, '_lot_reference', true);
        $typologie = get_post_meta($post->ID, '_lot_typologie', true);
        $surface = get_post_meta($post->ID, '_lot_surface', true);
        $etage = get_post_meta($post->ID, '_lot_etage', true);
        $orientation = get_post_meta($post->ID, '_lot_orientation', true);
        
        ?>
        <table class="form-table">
            <tr>
                <th><label>Référence</label></th>
                <td><strong><?php echo esc_html($reference); ?></strong></td>
            </tr>
            <tr>
                <th><label>Typologie</label></th>
                <td><?php echo esc_html($typologie); ?></td>
            </tr>
            <tr>
                <th><label>Surface</label></th>
                <td><?php echo esc_html($surface); ?> m²</td>
            </tr>
            <tr>
                <th><label>Étage</label></th>
                <td><?php echo esc_html($etage); ?></td>
            </tr>
            <tr>
                <th><label>Orientation</label></th>
                <td><?php echo esc_html($orientation); ?></td>
            </tr>
        </table>
        <?php
    }
    
    /**
     * Afficher la meta box financière
     */
    public static function render_financial_meta_box($post) {
        $prix_fai = get_post_meta($post->ID, '_lot_prix_fai', true);
        $loyer = get_post_meta($post->ID, '_lot_loyer_mensuel', true);
        $rentabilite = get_post_meta($post->ID, '_lot_rentabilite', true);
        
        ?>
        <div style="padding: 10px;">
            <p><strong>Prix FAI</strong><br>
            <span style="font-size: 20px; color: #1E40AF;"><?php echo number_format($prix_fai, 0, ',', ' '); ?> €</span></p>
            
            <p><strong>Loyer mensuel</strong><br>
            <?php echo number_format($loyer, 0, ',', ' '); ?> €</p>
            
            <p><strong>Rentabilité</strong><br>
            <span style="color: #F59E0B;"><?php echo number_format($rentabilite, 2); ?>%</span></p>
        </div>
        <?php
    }
}`;

  // Classe Sync Manager
  const syncManagerFile = `<?php
/**
 * Gestionnaire de synchronisation
 */

if (!defined('ABSPATH')) {
    exit;
}

class CRM_LMNP_Sync_Manager {
    
    /**
     * Synchroniser tous les lots
     */
    public static function sync_lots() {
        $result = CRM_LMNP_API::get_lots();
        
        if (!$result['success']) {
            return array(
                'success' => false,
                'message' => $result['message'],
                'count' => 0
            );
        }
        
        $lots = $result['data'];
        $count = 0;
        
        // Récupérer les résidences pour les données complémentaires
        $residences = CRM_LMNP_API::get_residences();
        $residences_map = array();
        foreach ($residences as $residence) {
            $residences_map[$residence['id']] = $residence;
        }
        
        foreach ($lots as $lot) {
            $post_id = self::create_or_update_lot($lot, $residences_map);
            if ($post_id) {
                $count++;
            }
        }
        
        return array(
            'success' => true,
            'message' => 'Synchronisation terminée',
            'count' => $count
        );
    }
    
    /**
     * Créer ou mettre à jour un lot
     */
    private static function create_or_update_lot($lot, $residences_map) {
        // Vérifier si le lot existe déjà
        $existing_post = get_posts(array(
            'post_type' => 'lot_lmnp',
            'meta_key' => '_lot_crm_id',
            'meta_value' => $lot['id'],
            'posts_per_page' => 1
        ));
        
        $post_id = $existing_post ? $existing_post[0]->ID : 0;
        
        // Préparer les données du post
        $post_data = array(
            'ID' => $post_id,
            'post_title' => 'Lot ' . $lot['reference'] . ' - ' . ($lot['residence_nom'] ?? ''),
            'post_content' => $lot['description'] ?? '',
            'post_status' => $lot['statut'] === 'disponible' ? 'publish' : 'draft',
            'post_type' => 'lot_lmnp'
        );
        
        // Créer ou mettre à jour le post
        if ($post_id) {
            wp_update_post($post_data);
        } else {
            $post_id = wp_insert_post($post_data);
        }
        
        if (!$post_id || is_wp_error($post_id)) {
            return false;
        }
        
        // Mettre à jour les meta données
        update_post_meta($post_id, '_lot_crm_id', $lot['id']);
        update_post_meta($post_id, '_lot_reference', $lot['reference'] ?? '');
        update_post_meta($post_id, '_lot_typologie', $lot['typologie'] ?? '');
        update_post_meta($post_id, '_lot_surface', $lot['surface'] ?? 0);
        update_post_meta($post_id, '_lot_etage', $lot['etage'] ?? '');
        update_post_meta($post_id, '_lot_orientation', $lot['orientation'] ?? '');
        update_post_meta($post_id, '_lot_prix_net_vendeur', $lot['prix_net_vendeur'] ?? 0);
        update_post_meta($post_id, '_lot_prix_fai', $lot['prix_fai'] ?? 0);
        update_post_meta($post_id, '_lot_loyer_mensuel', $lot['loyer_mensuel'] ?? 0);
        update_post_meta($post_id, '_lot_rentabilite', $lot['rentabilite'] ?? 0);
        update_post_meta($post_id, '_lot_gestionnaire', $lot['gestionnaire_nom'] ?? '');
        update_post_meta($post_id, '_lot_statut', $lot['statut'] ?? '');
        update_post_meta($post_id, '_lot_type_residence', $lot['type_residence'] ?? '');
        
        // Ajouter les photos
        if (!empty($lot['photos']) && is_array($lot['photos'])) {
            self::attach_photos($post_id, $lot['photos']);
        }
        
        // Associer les taxonomies
        if (!empty($lot['residence_nom'])) {
            wp_set_object_terms($post_id, $lot['residence_nom'], 'residence');
        }
        
        if (!empty($lot['statut'])) {
            $statut_label = self::get_statut_label($lot['statut']);
            wp_set_object_terms($post_id, $statut_label, 'statut_lot');
        }
        
        return $post_id;
    }
    
    /**
     * Attacher les photos au post
     */
    private static function attach_photos($post_id, $photos) {
        $existing_attachments = get_attached_media('image', $post_id);
        
        // Supprimer les anciennes photos
        foreach ($existing_attachments as $attachment) {
            wp_delete_attachment($attachment->ID, true);
        }
        
        // Ajouter les nouvelles photos
        $first_photo = true;
        foreach ($photos as $photo_url) {
            $attachment_id = self::upload_photo_from_url($photo_url, $post_id);
            
            // La première photo devient l'image mise en avant
            if ($first_photo && $attachment_id) {
                set_post_thumbnail($post_id, $attachment_id);
                $first_photo = false;
            }
        }
    }
    
    /**
     * Uploader une photo depuis une URL
     */
    private static function upload_photo_from_url($url, $post_id) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $tmp = download_url($url);
        
        if (is_wp_error($tmp)) {
            return false;
        }
        
        $file_array = array(
            'name' => basename($url),
            'tmp_name' => $tmp
        );
        
        $attachment_id = media_handle_sideload($file_array, $post_id);
        
        if (is_wp_error($attachment_id)) {
            @unlink($tmp);
            return false;
        }
        
        return $attachment_id;
    }
    
    /**
     * Obtenir le label du statut
     */
    private static function get_statut_label($statut) {
        $labels = array(
            'disponible' => 'Disponible',
            'sous_option' => 'Sous option',
            'allotement' => 'Allotement',
            'reserve' => 'Réservé',
            'compromis' => 'Compromis',
            'vendu' => 'Vendu'
        );
        
        return isset($labels[$statut]) ? $labels[$statut] : $statut;
    }
}`;

  // Page des paramètres
  const settingsPageFile = `<?php
/**
 * Page des paramètres du plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Ajouter la page de paramètres
 */
function crm_lmnp_add_settings_page() {
    add_submenu_page(
        'edit.php?post_type=lot_lmnp',
        'Paramètres CRM LMNP',
        'Paramètres',
        'manage_options',
        'crm-lmnp-settings',
        'crm_lmnp_render_settings_page'
    );
}
add_action('admin_menu', 'crm_lmnp_add_settings_page');

/**
 * Enregistrer les paramètres
 */
function crm_lmnp_register_settings() {
    register_setting('crm_lmnp_settings', 'crm_lmnp_api_token');
    register_setting('crm_lmnp_settings', 'crm_lmnp_sync_frequency');
}
add_action('admin_init', 'crm_lmnp_register_settings');

/**
 * Afficher la page de paramètres
 */
function crm_lmnp_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Sauvegarder les paramètres
    if (isset($_POST['submit'])) {
        check_admin_referer('crm_lmnp_settings');
        update_option('crm_lmnp_api_token', sanitize_text_field($_POST['crm_lmnp_api_token']));
        echo '<div class="notice notice-success"><p>Paramètres sauvegardés !</p></div>';
    }
    
    $api_token = get_option('crm_lmnp_api_token', '');
    
    ?>
    <div class="wrap">
        <h1>⚙️ Paramètres CRM LMNP Sync</h1>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Configuration de l'API Y'am Asset Management</h2>
            
            <form method="post" action="">
                <?php wp_nonce_field('crm_lmnp_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="crm_lmnp_api_token">Token API Y'am Asset Management</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="crm_lmnp_api_token" 
                                   name="crm_lmnp_api_token" 
                                   value="<?php echo esc_attr($api_token); ?>" 
                                   class="regular-text"
                                   placeholder="Votre token API Y'am Asset Management">
                            <p class="description">
                                Obtenez votre token API depuis votre dashboard Yam Management
                            </p>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <button type="submit" name="submit" class="button button-primary">
                        Sauvegarder les paramètres
                    </button>
                </p>
            </form>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>📊 Statistiques</h2>
            <?php
            $lot_count = wp_count_posts('lot_lmnp');
            $last_sync = get_option('crm_lmnp_last_sync', false);
            ?>
            <table class="widefat">
                <tr>
                    <td><strong>Lots importés</strong></td>
                    <td><?php echo $lot_count->publish + $lot_count->draft; ?></td>
                </tr>
                <tr>
                    <td><strong>Lots publiés</strong></td>
                    <td><?php echo $lot_count->publish; ?></td>
                </tr>
                <tr>
                    <td><strong>Dernière synchronisation</strong></td>
                    <td><?php echo $last_sync ? date('d/m/Y à H:i', $last_sync) : 'Jamais'; ?></td>
                </tr>
            </table>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px; background: #E8F5E9;">
            <h2>✅ Comment utiliser ce plugin ?</h2>
            <ol>
                <li>Configurez votre <strong>Token API Yam Management</strong> ci-dessus</li>
                <li>Le plugin se synchronise <strong>automatiquement toutes les 2 heures</strong></li>
                <li>Vous pouvez aussi synchroniser manuellement via le bouton <strong>"🔄 Sync CRM LMNP"</strong> dans la barre d'admin</li>
                <li>Les lots apparaîtront dans <strong>Lots LMNP</strong></li>
                <li>Personnalisez l'affichage avec votre thème WordPress</li>
            </ol>
        </div>
    </div>
    <?php
}`;

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileCode className="w-8 h-8 text-[#1E40AF]" />
            <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Plugin WordPress - Guide Complet</h1>
          </div>
          <p className="text-slate-500">
            Synchronisation automatique des lots LMNP avec WordPress
          </p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">🎯 Ce que fait ce plugin</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✅ <strong>Synchronisation automatique</strong> toutes les 2 heures</p>
            <p>✅ <strong>Bouton de sync manuelle</strong> dans l'admin WordPress</p>
            <p>✅ <strong>Custom Post Type</strong> "Lots LMNP" avec toutes les métadonnées</p>
            <p>✅ <strong>Import des photos</strong> automatique</p>
            <p>✅ <strong>Taxonomies</strong> pour résidences et statuts</p>
            <p>✅ <strong>Filtre automatique</strong> : seuls les lots avec "Publié sur WordPress" = Oui sont synchronisés</p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mb-6">
          <Button onClick={downloadAllFiles} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Télécharger tous les fichiers
          </Button>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="main">Plugin Principal</TabsTrigger>
            <TabsTrigger value="api">API Class</TabsTrigger>
            <TabsTrigger value="post">Post Type</TabsTrigger>
            <TabsTrigger value="sync">Sync Manager</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="main">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📄 crm-lmnp-sync.php</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(mainPluginFile, 'main')}
                  >
                    {copiedFile === 'main' ? (
                      <><Check className="w-4 h-4 mr-2 text-green-600" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{mainPluginFile}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📄 includes/class-crm-api.php</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiClassFile, 'api')}
                  >
                    {copiedFile === 'api' ? (
                      <><Check className="w-4 h-4 mr-2 text-green-600" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{apiClassFile}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📄 includes/class-lot-post-type.php</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(postTypeFile, 'post')}
                  >
                    {copiedFile === 'post' ? (
                      <><Check className="w-4 h-4 mr-2 text-green-600" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{postTypeFile}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📄 includes/class-sync-manager.php</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(syncManagerFile, 'sync')}
                  >
                    {copiedFile === 'sync' ? (
                      <><Check className="w-4 h-4 mr-2 text-green-600" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{syncManagerFile}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📄 admin/settings-page.php</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(settingsPageFile, 'settings')}
                  >
                    {copiedFile === 'settings' ? (
                      <><Check className="w-4 h-4 mr-2 text-green-600" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{settingsPageFile}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">📦 Installation du Plugin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-green-800">
            <div>
              <h3 className="font-semibold mb-2">1️⃣ Structure des fichiers</h3>
              <div className="bg-white p-3 rounded border border-green-200 font-mono text-xs">
                wp-content/plugins/crm-lmnp-sync/<br/>
                ├── crm-lmnp-sync.php<br/>
                ├── includes/<br/>
                │   ├── class-crm-api.php<br/>
                │   ├── class-lot-post-type.php<br/>
                │   └── class-sync-manager.php<br/>
                └── admin/<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;└── settings-page.php
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2️⃣ Activation</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Créez le dossier <code>crm-lmnp-sync</code> dans <code>wp-content/plugins/</code></li>
                <li>Placez tous les fichiers selon la structure ci-dessus</li>
                <li>Allez dans <strong>Extensions</strong> → <strong>Extensions installées</strong></li>
                <li>Activez <strong>"CRM LMNP Sync"</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3️⃣ Configuration</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Allez dans <strong>Lots LMNP</strong> → <strong>Paramètres</strong></li>
                <li>Entrez votre <strong>Token API Yam Management</strong></li>
                <li>Cliquez sur <strong>"Sauvegarder"</strong></li>
                <li>Cliquez sur <strong>"🔄 Sync CRM LMNP"</strong> dans la barre d'admin pour tester</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4️⃣ Vérification</h3>
              <p>Allez dans <strong>Lots LMNP</strong> pour voir vos lots importés !</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">⚠️ Important - Configuration de l'URL API</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-800">
            <p className="mb-2">
              Dans le fichier <code>includes/class-crm-api.php</code>, ligne 11, remplacez :
            </p>
            <div className="bg-white p-3 rounded border border-amber-300 font-mono text-xs mb-2">
              private static $api_url = 'https://api.base44.com';
            </div>
            <p>
              Par l'URL réelle de votre API Yam Management (vous la trouverez dans votre dashboard Yam Management).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}